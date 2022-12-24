import icon512 from "../assets/favicon-512x512.png";

export const HeroImage = () => {
    return (
        <div className="flex justify-center w-full h-128 bg-cover bg-[url('./assets/abstract_bg.jpeg')]" >
            <div className="w-3/4 md:w-1/2 p-3">
                <div className="flex flex-col justify-center items-center h-full">
                    <img src={icon512} className="w-48 h-48" />
                    <div className="text-center text-3xl md:text-4xl font-bold text-slate-800">Welcome to niftyX.net</div>
                    <div className="text-center glow-yellow text-2xl md:text-3xl font-bold text-slate-100">The fun and simple way to use Stable Diffusion AI to create, share and sell NFTs on the XRPL blockchain.</div>
                    <div className="text-center glow-yellow mt-3 md:text-2xl font-bold text-yellow-400">All NFTs cost only 0.25XRP to generate and mint!</div> 
                </div>
            </div>
      </div>
    );
  };

export const ActionList = () => {
    return (
        <div className="p-6">
            <div className="grid gap-3 text-white sm:grid-cols-1 md:grid-cols-3">
                <div className="flex flex-row justify-start rounded-md border-2 p-2">
                <div className="items-baseline p-2 text-4xl">1</div>
                <div className="items-baseline p-2 text-xl">Enter any <a className="underline" href="https://en.wikipedia.org/wiki/Stable_Diffusion" target="_blank">Stable Diffusion</a> prompt describing the image you want to mint</div>
                </div>
                <div className="flex flex-row justify-start rounded-md border-2 p-2">
                <div className="items-baseline p-2 text-4xl">2</div>
                <div className="items-baseline p-2 text-xl">Authorize payment to generate image in xumm for 0.25 XRP</div>
                </div>
                <div className="flex flex-row justify-start rounded-md border-2 p-2">
                <div className="items-baseline p-2 text-4xl">3</div>
                <div className="items-baseline p-2 text-xl">Generate up to 4 images and then authourize mining with your xumm wallet</div>
                </div>
            </div>
        </div>
    );
};