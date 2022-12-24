import React, { useState, useEffect  } from 'react';

import Axios from 'axios';
Axios.defaults.withCredentials = false; 

import { PayloadService } from '../service/PayloadService';
import {Spinner} from "./Base";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const JWTImage = ({ src, alt, title, jwt }) => {
  const imageSrc = src + (jwt ? `?authorization=${jwt}` : '');

  return (
    <img src={imageSrc} alt={alt} title={title} />
  );
};

function ImageRefresher({imageOrigin, className}) {
  const [imageSrc, setImageSrc] = React.useState(null);

  React.useEffect(() => {
    async function fetchImage() {
      try {
        const response = await Axios.get(imageOrigin, { 
          headers: {
            Authorization: null,
          }, responseType: 'blob' });

        const blob = new Blob([response.data], { type: 'image/jpeg' });
        setImageSrc(URL.createObjectURL(blob));
      } catch (error) {
        console.error(error);
      }
    }

    fetchImage();
  }, []);

  return <img className={className} src={imageSrc} alt="image" />;
}

const MintNftModal = ({ 
  xumm=null, 
  isWebApp=false, 
  isXApp=false}) => {

  const [showModal, setShowModal] = useState(false);

  const [formState, setFormState] = useState({'prompt': 'an astronaut riding a unicorn'});
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(0);
  const [payment, setPayment] = useState(null);
  const [mintTx, setMintTx] = useState(null);
  const [wsclient, setWsclient] = useState();
  const [generateURL, setGenerateURL] = useState(null);
  const [dataFromServer, setDataFromServer] = useState(null);
  const [modalTitle, setModalTitle] = useState('Choose a prompt and pay to generate an image');
  const [remaining, setRemaining] = useState(3);

  const handleInputChange = event => {
    const target = event.target
    let value = target.value
    const name = target.name
    console.log(name, value);

    if(name === 'price'){
      value = value.replace(/[^\d.-]/g, '');
    }

    setFormState((formState) => ({
      ...formState,
      [name]: value
    }));  
  };  

  const payToGenerateImage = async (event) => {
    setStage(-1);
    console.log('payToGenerateImage Formstate', formState);

    PayloadService.getPayment(formState.prompt).then((res) => {  
      console.log("payment response", res.data);
      setStage(1);
      setPayment(res.data);
      setModalTitle('Use xumm wallet to sign the payment transaction');

      const client = new W3CWebSocket(res.data.refs.websocket_status);

      client.onopen = () => {
        console.log('WebSocket Client Connected');
      };

      client.onclose = () => {
        console.log('WebSocket Client Closed');
      };

      client.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        let keys = Object.keys(dataFromServer);
        if (
          keys.includes('payload_uuidv4') && 
          keys.includes('signed') && 
          dataFromServer.signed === true
        ){
          setStage(-1);
          setModalTitle(`Payment signed, generating image (${remaining+1} remaining)`);
          PayloadService.postGenerate(dataFromServer.payload_uuidv4).then((res) => {
            console.log(res.data);
            setGenerateURL(res.data.img_src);
            setDataFromServer(dataFromServer);
            client.close();
            setStage(2);
            setModalTitle(`Select this image or generate another one (${remaining} remaining)`);
          }).catch((err) => {
            console.log(err);
            setError(err);
          });
        };      
        setWsclient(client);
      }

      if (xumm && isXApp) {
        xumm.xapp.openSignRequest({ uuid: res.data.uuid });
      } 

    }).catch((err) => {
      console.log(err);
      setError(err);
    });



      // if (xumm && isXApp) {
      //   xumm.environment?.jwt.then((res) => {
      //       console.log("xumm environment jwt", res);

      //       PayloadService.getPayment(formState.prompt).then((res) => {  
      //         console.log("payment response", res.data);
      //         setStage(1);
      //         setPayment(res.data);
      //         setModalTitle('Use xumm wallet to sign the payment transaction');
        
      //         const client = new W3CWebSocket(res.data.refs.websocket_status);
        
      //         client.onopen = () => {
      //           console.log('WebSocket Client Connected');
      //         };
      
      //         client.onclose = () => {
      //           console.log('WebSocket Client Closed');
      //         };
      
      //         client.onmessage = (message) => {
      //           const dataFromServer = JSON.parse(message.data);
      
      //           let keys = Object.keys(dataFromServer);
      //           if (
      //             keys.includes('payload_uuidv4') && 
      //             keys.includes('signed') && 
      //             dataFromServer.signed === true
      //           ){
      //             setStage(-1);
      //             setModalTitle(`Payment signed, generating image (${remaining+1} remaining)`);
      //             PayloadService.postGenerate(dataFromServer.payload_uuidv4).then((res) => {
      //               console.log(res.data);
      //               setGenerateURL(res.data.img_src);
      //               setDataFromServer(dataFromServer);
      //               client.close();
      //               setStage(2);
      //               setModalTitle(`Select this image or generate another one (${remaining} remaining)`);
      //             }).catch((err) => {
      //               console.log(err);
      //               setError(err);
      //             });
      //           };      
      //           setWsclient(client);
      //         }

      //         if (xumm && isXApp) {
      //           xumm.xapp.openSignRequest({ uuid: res.data.uuid });
      //         } 
        
      //       }).catch((err) => {
      //         console.log(err);
      //         setError(err);
      //       });

      //   });
      // } else {
      //   PayloadService.getPayment(formState.prompt).then((res) => {
    
      //   console.log("payment response", res.data);
      //   setStage(1);
      //   setPayment(res.data);
      //   setModalTitle('Use xumm wallet to sign the payment transaction');
  
      //   const client = new W3CWebSocket(res.data.refs.websocket_status);
  
      //   client.onopen = () => {
      //     console.log('WebSocket Client Connected');
      //   };

      //   client.onclose = () => {
      //     console.log('WebSocket Client Closed');
      //   };

      //   client.onmessage = (message) => {
      //     const dataFromServer = JSON.parse(message.data);

      //     let keys = Object.keys(dataFromServer);
      //     if (
      //       keys.includes('payload_uuidv4') && 
      //       keys.includes('signed') && 
      //       dataFromServer.signed === true
      //     ){
      //       setStage(-1);
      //       setModalTitle(`Payment signed, generating image (${remaining+1} remaining)`);
      //       PayloadService.postGenerate(dataFromServer.payload_uuidv4).then((res) => {
      //         console.log(res.data);
      //         setGenerateURL(res.data.img_src);
      //         setDataFromServer(dataFromServer);
      //         client.close();
      //         setStage(2);
      //         setModalTitle(`Select this image or generate another one (${remaining} remaining)`);
      //       }).catch((err) => {
      //         console.log(err);
      //         setError(err);
      //       });
      //     };
      //   };

      //   setWsclient(client);
  
      //   }).catch((err) => {
      //     console.log(err);
      //     setError(err);
      //   });
      // }


  }

  const handleGenerate = async (event) => {
    setStage(-1);
    setModalTitle(`Generating image (${remaining} remaining)`);
    PayloadService.postGenerate(dataFromServer.payload_uuidv4).then((res) => {
      console.log(res.data);
      setGenerateURL(res.data.img_src);
      const newRemaining = remaining - 1;
      setRemaining(newRemaining);
      if(newRemaining > 0){
        setModalTitle(`Select this image or generate another one (${newRemaining} remaining)`);
      } else {
        setModalTitle("Sorry, you've reached your limit, mint or cancel and try again");
      }
      
      setStage(2);
    }).catch((err) => {
      console.log(err);
      setError(err);
    });
  }

  const handleMintNft = async (event) => {
    setStage(-1);
    setModalTitle("Building mint transaction");
    PayloadService.postMintNft(dataFromServer.payload_uuidv4)
    .then((res) => {
      console.log(res.data);
      setStage(3);
      setMintTx(res.data);
      setModalTitle("Use xumm to sign the mint transaction");

      const client = new W3CWebSocket(res.data.refs.websocket_status);

      client.onopen = () => {
        console.log('WebSocket Client Connected');
      };

      client.onclose = () => {
        console.log('WebSocket Client Closed');
      };

      client.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        let keys = Object.keys(dataFromServer);
        if (
          keys.includes('payload_uuidv4') && 
          keys.includes('signed') && 
          dataFromServer.signed === true
        ){
          // reset the state
          setStage(0);
          setRemaining(3);
          setDataFromServer(null);
          setGenerateURL(null);
          setMintTx(null);
          setPayment(null);
          setShowModal(false);
          console.log('Minted NFT');
          client.close();
          window.location.reload();
        };
      };

      setWsclient(client);
        
      if (xumm && isXApp) {
        xumm.xapp.openSignRequest({ uuid: res.data.uuid });
      } 

    }).catch((err) => {
      console.log(err);
      setError(err);
    });
  }

  return (
    <>
      <div className="btn-common bg-slate-700 text-white hover:bg-slate-600 text-sm"
        onClick={()=>setShowModal(!showModal)}>               
            <span>Mint NFT</span>
        </div>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-3/4 my-6 mx-auto max-w-4xl bg-slate-600 rounded-lg shadow-lg">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid marker:rounded-t ">
                  <h3 className="text-3xl font-heading break-words w-96">{modalTitle}</h3>
                </div>
                <div className='p-2 bg-yellow-200 w-full text-slate-800'>
                  <ol className="ml-3 list-decimal text-sm break-words">
                    <li>Enter prompt. <a className='cursor-pointer text-bold underline' href="https://promptomania.com/stable-diffusion-prompt-builder/" target="_blank">Get prompt help</a></li>
                    <li>Authorize payment to generate image in xumm.</li>
                    <li>Authorize minting of NFT in xumm.</li>
                  </ol>                      
                </div>
                <div className="relative p-6">
                  <div className="flex flex-col justify-center">
                    {stage === -1 && 
                    <div className="flex items-center w-full flex-col justify-center">
                      <div className='w-fit'><Spinner animation="border" /></div>
                      <div className='text-sm w-fit'>Hang a few secs, we are doing stuff...</div>  
                    </div>}
                    
                    {stage === 0 && <textarea
                      name="prompt"
                      value={formState.prompt}
                      onChange={handleInputChange}
                      className="text-slate-800 w-full h-32 p-2 border-2 border-gray-300
                        rounded outline-none  focus:border-gray-400 text-base placeholder-gray-400 font-mono"
                      placeholder="Stable diffusion image prompt."
                    ></textarea>}

                    {stage === 1 && payment && <div className="flex flex-row w-full justify-center">
                      {payment.refs && payment.refs.qr_png &&
                        <img className="w-96 h-96 rounded" src={payment.refs.qr_png} alt="qr_code" />}                   
                    </div>}
                    {stage === 2 && payment && generateURL && <div className="flex flex-row w-full justify-center">
                      <ImageRefresher className="w-96 h-96 rounded" imageOrigin={generateURL} alt="generated_image" />
                    </div>}
                    {stage === 3 && payment && <div className="flex flex-row w-full justify-center">
                      <img className="w-96 h-96 rounded" src={mintTx.refs.qr_png} alt="qr_code" />
                    </div>}

                  </div>

                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-yellow-200 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  {stage === 0 && <button
                    className="btn-common bg-slate-700 text-white hover:bg-slate-500 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={(e) => payToGenerateImage(e)}
                  >Pay To Generate</button>}

                  {stage === 2 && 
                  <div className='flex flex-row'>
                    {remaining>0 && <button
                      className="btn-common bg-yellow-700 text-white hover:bg-slate-500 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                      type="button"
                      onClick={(e) => handleGenerate(e)}
                      >Try Again</button>}
                    <button
                      className="btn-common bg-green-700 text-white hover:bg-slate-500 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                      type="button"
                      onClick={(e) => handleMintNft(e)}
                      >Mint This Image</button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

  export default MintNftModal;