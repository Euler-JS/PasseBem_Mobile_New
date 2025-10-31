import socketio from 'socket.io-client';


//  const baseURL = "http://192.168.5.242:3333/";
//  const baseURL "https://api.passebem.co.mz/"
const baseURL = "https://passe-bem-mobile-new-fork-8bbo.vercel.app/";

const socket = socketio(baseURL, {
    autoConnect: false,
})


function sendData(messages){

    socket.emit('newsms', messages)
    
    /* socket.io.opts.query ={
        messages
    } */

}

export{
    sendData,
    socket
}