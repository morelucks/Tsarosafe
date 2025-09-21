import Image from "next/image";
import bgImage from "./assets/Tsarosafe.png"
import bgImage2 from "./assets/image 7.png"
import Pointer from "./assets/Group.png"
import WhyUs from "./components/WhyUs"
import HowItWorks from "./components/HowItWorks"

const LandingPage = () => {
  return (
    <div className="mt-5">
        <div className="mb-10">
        <div className="md:w-[60%]">
            <h2 className="font-semibold text-5xl leading-10 font-wix fade-in" style={{ animationDelay: '0.2s' }}>Save Smarter, Together or Individually.</h2>
            <p className="text-lg leading-6 mt-3 w-[80%] font-montserrat fade-in" style={{ animationDelay: '0.4s' }}>Empower your financial journey with savings plans that work for you, whether you're saving solo or as part of a group.</p>
        </div>

        {/* image section */}
        <div>
             <div className="relative">
                <div className=" md:h-72 fade-in" style={{ animationDelay: '0.6s' }}>
                    <Image src={bgImage} alt="Tsarosafe bground image" className="object-fill w-full h-full" width={100} height={100} priority />
                </div>

                <div className="absolute left-[30%] bottom-0 bg-transparent w-96 h-80 fade-in" style={{ animationDelay: '0.8s' }}>
                    <img src={bgImage2.src} alt="bground image" className="object-fill w-full h-full"/>
                </div>

             </div>
        </div>

        <div className="flex flex-row items-center fade-in" style={{ animationDelay: '1.0s' }}>
            {/* <button className="rounded-full bg-blue-900 text-white font-wix py-4 px-5">
            Connect your wallet
            </button> */}
            <button className="rounded-full bg-white text-blue-900 font-wix py-2 px-5 flex flex-row items-center border border-blue-900 ml-4">
            Learn more
            <div  className=" ml-2 bg-blue-900 p-3 rounded-full text-center flex items-center "> 
            <img src={Pointer.src} alt="" className="object-cover  text-white w-2 h-2"/>
            </div>
            
            </button>
        </div>
        </div>
        <WhyUs className="mt-10"/>
        {/* <HowItWorks/> */}
    </div>
  )
}

export default LandingPage
