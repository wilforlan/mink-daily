import React from "react"

function YourLinks() {
  return (
    <div className="bg-gray-100 font-sans leading-normal tracking-normal h-screen flex flex-col">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-3xl font-bold text-center">Your Pages</h1>
      </header>
      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 1</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the first link. It provides an overview of what the link is about.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 2</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the second link. It gives a brief description of the content.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 3</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the third link. It highlights the main points of interest.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 4</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the fourth link. It explains what users can expect.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 5</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the fifth link. It provides insights into the topic.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-2">Link Title 6</h2>
            <p className="text-gray-700 mb-4">This is a short summary of the sixth link. It gives a concise overview.</p>
            <a href="#" className="text-blue-500 hover:underline">Read more</a>
          </div>
        </div>
      </main>
      <footer className="bg-white shadow-md p-4 text-center">
        <p className="text-gray-600">© 2023 Link List. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default YourLinks