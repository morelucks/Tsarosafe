const HowItWorks = () => {
  return (
    <div className="mb-6 relative">
      <div className="md:w-[60%]">
        <h2 className="font-semibold text-5xl leading-10 font-wix">
        How It Works
        </h2>
        <p className="text-lg leading-6 mt-4 w-[80%] font-montserrat">
        A simple, step-by-step process to start saving securely..
        </p>
      </div>
      {/* description */}
       <div>
        <div>
            <ul>
                <li className="flex flex-row items-center">
                    <span className="bg-blue-700 rounded-full p-3 text-white ">1</span>
                    <div className="font-wix border-2 rounded-xl shadow-md px-3 py-2 ml-2">
                        <span className="text-xs leading-3 font-medium">Step 1</span>
                        <h2 className="font-semibold  text-sm">Connect Your Account</h2>
                        <p className="font-normal text-sm">Link your  wallet to the platform.</p>
                    </div>
                </li>
            </ul>
        </div>
       </div>
    </div>
  );
};

export default HowItWorks;
