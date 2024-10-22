// import { sendToBackground } from "@/src/background/utils"
import { ArrowLongRightIcon } from "@heroicons/react/20/solid"
import { sendToBackground } from "@plasmohq/messaging"
import React from "react"
import { useUser } from "../providers/user.provider"

const extensionId = process.env.PLASMO_PUBLIC_EXTENSION_ID

function AddAccountInfo() {
    const [email, setEmail] = React.useState("")
    const [apiKey, setApiKey] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [isError, setIsError] = React.useState(false)
    const [error, setError] = React.useState("")
    const { setUser } = useUser();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setIsError(false);
        setError(null);
        try {
            const data = {
                email,
                llmApiKey: apiKey,
                llmPlatform: 'openai',
            };
            // send to background
            const resp = await sendToBackground({
                name: "complete-account-setup",
                body: data,
            });
            if (!resp.status || !resp.info) throw new Error(
                resp.error || "Failed to set account info"
            );
            setUser(resp.info);
            setIsSubmitted(true);
        } catch (err) {
            setIsError(true);
            setError(err.message);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center">
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {isError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>}
                <div className="space-y-6">
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
                                OpenAI API Key
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                placeholder="sk-..."
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                onChange={(e) => setApiKey(e.target.value)}
                                disabled={isSubmitting}
                                className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Please wait...' : 'Set Up My Account'}
                        </button>
                    </div>
                    <p className="mt-10 text-center text-sm text-gray-500">
                        Don't have an OpenAI API Key?{' '}
                        <a href="https://platform.openai.com" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Set up now.
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

function AccountSetUp() {
    const [shouldShowAccountInfo, setShouldShowAccountInfo] = React.useState(false)
    return (
        <div className="font-sans leading-normal tracking-normal h-screen flex items-center justify-center">
            <div className="p-8 max-w-sm w-full">
                <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Mink</h1>
                <p className="text-center text-gray-700"> Your daily web research and work assistant. Set up your account to get started. Your data only exist on your browser and we never share your data or private keys with anyone. </p>
                {!shouldShowAccountInfo && <button
                    className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-400 transition-all duration-300 ease-in-out flex items-center justify-center mt-5"
                    onClick={() => setShouldShowAccountInfo(true)}
                >
                    <i className="fa-brands fa-google mr-2"></i> Set Up My Account
                </button>}
                {shouldShowAccountInfo && <AddAccountInfo />}
            </div>
        </div>
    )
}

export default AccountSetUp
