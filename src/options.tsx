import "./style.css"
import type { Provider, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { supabase } from "@/src/core/supabase"
import icon from "data-base64:~content-assets/icon.png"

function IndexOptions() {
    const [user, setUser] = useStorage<User>({
        key: "user",
        instance: new Storage({
            area: "local"
        })
    })

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [isLogin, setIsLogin] = useState(true)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        async function init() {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error(error)
                return
            }
            if (!!data.session) {
                setUser(data.session.user)
                sendToBackground({
                    name: "init-session",
                    body: {
                        refresh_token: data.session.refresh_token,
                        access_token: data.session.access_token
                    }
                })
            }
        }

        init()
    }, [])

    const handleEmailLogin = async (
        type: "LOGIN" | "SIGNUP",
        email: string,
        password: string,
        username?: string
    ) => {
        setIsSubmitting(true)
        setError("")
        try {
            const {
                error,
                data: { user }
            } =
                type === "LOGIN"
                    ? await supabase.auth.signInWithPassword({
                        email,
                        password
                    })
                    : await supabase.auth.signUp({ email, password, options: { data: {
                        username,
                        email,
                        display_name: username,
                        displayName: username,
                        full_name: username,
                        planTier: "free",
                        stripeCustomerId: "",
                        stripeSubscriptionId: "",
                        stripePriceId: "",
                        stripeCurrentPeriodEnd: "",
                    } } })

            if (error) {
                console.log("error", error.message)
                setError(error.message)
            } else {
                setUser(user)
                const resp = await sendToBackground({
                    name: "complete-account-setup",
                    body: { ...user, isNewUser: type === "SIGNUP" },
                });
                if (!resp.status || !resp.info) setError("Sorry, something went wrong. Please try again later.")
                setSuccess(true)
            }
            setIsSubmitting(false)
        } catch (error) {
            console.log("error", error)
            setError(error.error_description || error)
            setIsSubmitting(false)
        }
    }

    const handleOAuthLogin = async (provider: Provider, scopes = "email") => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                scopes,
                redirectTo: location.href
            }
        })
    }

    return success ? (
        <div>
            <div className="flex min-h-full flex-1 flex-col justify-center">
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div>
                        <div className="flex items-center">
                            <img src={icon} alt="Mink Logo" className="w-20 h-16" />
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 text-3xl">
                                Mink
                                <span className="ml-2 inline-block bg-yellow-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
                            </h2>
                        </div>
                    </div>
                    <div>
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                            <strong className="font-bold">Successfully {isLogin ? "logged in" : "signed up"}!</strong>
                            <span className="block sm:inline ml-2">You can now close this tab and continue to use Mink.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div>
            <div className="flex min-h-full flex-1 flex-col justify-center">
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div>
                        <div className="flex items-center">
                            <img src={icon} alt="Mink Logo" className="w-20 h-16" />
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 text-3xl">
                                Mink
                                <span className="ml-2 inline-block bg-yellow-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
                            </h2>
                        </div>
                        <p className="text-center text-lg text-gray-500 mt-4">
                            Set up your account to get started.
                        </p>
                        {!isLogin && <p className="text-center text-sm text-gray-500">
                            Already have an account? <button
                                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                                onClick={() => setIsLogin(true)}>Login Instead</button>
                        </p>}
                        {isLogin && <p className="text-center text-sm text-gray-500">
                            Don't have an account? <button
                                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                                onClick={() => setIsLogin(false)}>Sign Up Instead</button>
                        </p>}
                    </div>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                        <strong className="font-bold">Something went wrong!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>}
                    <div className="space-y-6 mt-10">
                        {!isLogin && <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    placeholder="username"
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="youremail@company.xyz"
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    placeholder="************"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsSubmitting(true)
                                    if (isLogin) {
                                        handleEmailLogin("LOGIN", email, password)
                                    } else {
                                        handleEmailLogin("SIGNUP", email, password, username)
                                    }
                                }}
                            >
                                {isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                            </button>
                        </div>
                        <p className="mt-10 text-center text-sm text-gray-500">
                            By signing up you agree with the Mink.{' '}
                            <a href="https://platform.openai.com" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                                Terms of Service.
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/*
            <button
                onClick={(e) => {
                    handleOAuthLogin("github")
                }}>
                Sign in with GitHub
            </button> */}
        </div>
    )
}

export default IndexOptions