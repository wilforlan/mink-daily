import React from "react"
import "../style.css"
// import useFirebaseUser from "@/lib/firebase/useFirebaseUser"
import AuthForm from "@/src/components/AuthForm"
import GoogleLogin from "@/src/components/GoogleButton"

const extensionId = process.env.PLASMO_PUBLIC_EXTENSION_ID

function AuthTab() {
    // const { user, isLoading, onLogin } = useFirebaseUser()

    // console.log({ user })
    const setUpAccount = () => {
        // open new tab to auth page
        const authUrl = `chrome-extension://${extensionId}/auth`
        window.open(authUrl, "_blank", "width=600,height=600")
    }

    return (
        <div className="flex items-center justify-center w-full p-4 overflow-x-hidden rounded-xl overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="w-full max-w-2xl max-h-full">
                <div className="p-10 bg-white rounded-lg shadow">
                    <GoogleLogin onClick={setUpAccount} />
                </div>
            </div>
        </div>
    )
}

export default AuthTab
