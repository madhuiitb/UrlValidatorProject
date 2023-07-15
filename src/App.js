import React, { useState } from 'react'
import InputBox from './components/InputBox';
import Option from './components/Option';


const REG_EXP = new RegExp(
  '^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

const OPTIONS = ['Check for a 200 Status', 'SSL Certificate Verification', 'Content of Robert.txt'];

const RATE_LIMIT=3; // Limiting the fetching 3 queries with given duration
const DURATION = 5*60*1000; // 1 sec-> 1000 milli seconds , 300sec --> 300*1000 milli seconds.

export default function App() {

  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [contentMessage, setContentMessage] = useState("");
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState('')

  function handleValidationUrl(url){
    return REG_EXP.test(url);
  }
  function handleSubmitForm(e){
    e.preventDefault();
    const isValid = handleValidationUrl(url);
    if (isValid) {
      setMessage("Valid");
    } else {
      setMessage("Not Valid");
    }
    setIsValid(isValid);
    
  }

  function handleInputChange(e){
    const { value } = e.target;
    setUrl(value);
  }

  async function handleStatus(){
    try {
      const response = fetch(url);
      if((await response).status ===200){
        setStatusMessage("Status Success");
      } 
    } catch (error) {
      setStatusMessage(error.message);
    }

  }

  function handleSSLC(){
    // sslc validation goes here.
  }

  async function handleContent(){
    const finalUrl = `https://www.robotstxt.org/robotstxt.html`
    try {
      const response = fetch(finalUrl);
      const data = await response.json();
      console.log(data)
      setContentMessage("Content Found");
    } catch (error) {
      setContentMessage("Content not found");
    }
  }


  function handlerSelectOption(event){
    const {value} = event.target;
    switch(value){
      case 'Check for a 200 Status':
        return handleStatus();
      case 'SSL Certificate Verification':
        return handleSSLC();
      case 'Content of Robert.txt':
        return handleContent();
      default:
        return;
    }
}





async function fetchWithRateLimiter(){
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, { signal }).then((resp) => {
        resp.json().then((e) => {
          resolve(e);
      }).catch((error) => {
        reject(error);
      })
     })
      .catch((error) => {
      reject(error);
    });
    setRateLimitCount(count=>count+1);

    if(rateLimitCount >= RATE_LIMIT){
      setRateLimitMessage("Limit has reached so Aborted");
      setRateLimitCount(0);
      controller.abort();
    }
    setTimeout(() => {
      console.log(rateLimitCount);
      setRateLimitMessage("");
      setRateLimitCount(0);
    }, DURATION );
    
  })
}

function handleRateLimiter(){
  fetchWithRateLimiter().then((resp) => {
  console.log(resp);
}).catch((error) => {
  console.error(error.message);
});
}


  return (
    <div className='app'>
      <form className='form' onSubmit={handleSubmitForm}>
        <div className='inputbox'>
      <InputBox
            id='url'
            type='text'
            value={url}
            label='URL'
            onChange={handleInputChange}
          />
        </div>
        {message && (
          <p style={isValid ? { color: "#446A46" } : { color: "#990000" }}>
            {message}
          </p>
        )}
        <button type='submit'>Submit</button>

        <div className='dropdown-div'>
        <select className='dropdown-select' onChange={handlerSelectOption}>
                    {OPTIONS.map((option, index) => {
                      return <Option key={index} value={option} url={url} />
                    })}
                </select>
        {statusMessage && <p>{statusMessage}</p>}
        {contentMessage && <p>{contentMessage}</p>}
        </div>
        <div>
        <button className='ratelimit' onClick={handleRateLimiter}>Rate Limiter</button>
        {rateLimitCount && rateLimitMessage ? <span className='ratelimit-message'>{rateLimitMessage}</span>:''}
        </div>
      </form>
      
      </div>
  )
}
