import socketio from 'socket.io-client';


//  const baseURL = "http://192.168.5.242:3333/";
//  const baseURL "https://api.passebem.co.mz/"
const baseURL = "http://mowosocw4sgwsk84kw4ks40c.62.171.183.132.sslip.io/";

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