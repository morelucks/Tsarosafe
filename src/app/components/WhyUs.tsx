import FirstIcon from "../assets/ph_arrows-split-light.png"
import SecondIcon from "../assets/iconamoon_shield-light.png"
import ThridIcon from "../assets/ph_arrows-split-light.png"
import DecentralizeImage from "../assets/Future-is-Decentralized.jpg"
const WhyUs = () => {
  return (
    <div className="mb-20 relative ">
       <div className="md:w-[60%]">
            <h2 className="font-semibold text-5xl leading-10 font-wix">Why Choose Us</h2>
            <p className="text-lg leading-6 mt-4 w-[80%] font-montserrat">We offer innovative features to simplify and secure your savings journey.</p>
        </div>
        {/* card */}
        <div className="mt-7 flex flex-row items-center">
            {/* first card */}
            <div className="flex flex-col items-center w-60 border-2 rounded-xl px-4 h-64 py-7 shadow-lg">
                <div className="bg-blue-900 w-10 h-10 p-3 rounded-full">
                    <img src={FirstIcon.src} alt="" />
                </div>
                <div className="flex flex-col items-center mt-10">
                    <h2 className="font-semibold leading-5 font-wix">Flexibility</h2>
                    <p className="font-normal font-wix  text-base text-center mt-5" >Save and grow your finances the way you want</p>
                </div>
            </div>
             {/* first card */}
             <div className="flex flex-col items-center w-60 border-2 rounded-xl px-4 h-64 py-7  ml-8 shadow-lg" >
                <div className="bg-blue-900 w-10 h-10 p-3 rounded-full">
                    <img src={SecondIcon.src} alt="" />
                </div>
                <div className="flex flex-col items-center mt-10">
                    <h2 className="font-semibold leading-5 font-wix">Reliability</h2>
                    <p className="font-normal font-wix  text-base text-center mt-5" >Count on our secure platform to keep your funds safe and growing.</p>
                </div>
            </div>
             {/* first card */}
             <div className="flex flex-col items-center w-60 border-2 rounded-xl px-4 h-64 py-7 ml-10 shadow-lg">
                <div className="bg-blue-900 w-10 h-10 p-3 rounded-full">
                    <img src={ThridIcon.src} alt="" />
                </div>
                <div className="flex flex-col items-center mt-10">
                    <h2 className="font-semibold leading-5 font-wix">Security</h2>
                    <p className="font-normal font-wix  text-base text-center mt-5" >Our top-notch security ensures your data and savings are always protected.</p>
                </div>
            </div>
        </div>

          <div className="w-96  absolute top-[40%] right-0"> 
             <img src={DecentralizeImage.src} alt="" className="w-full h-full" />
          </div>
    </div>
  )
}

export default WhyUs
