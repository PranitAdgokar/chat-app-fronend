import React from 'react'
import ComingSoon from '../components/coming-soon'

const HomePage = () => {
  return (
    <div className=" h-screen flex justify-center items-center text-center flex-col">
      <div className="">
          <h1 className="text-4xl font-bold">Welcome to Chatify</h1>
          <p className="text-base-content/70">The best place to chat with your friends</p>
    
      </div>
         <div className="mt-10">   
          <ComingSoon />
        </div>

    </div>
  )
}

export default HomePage
