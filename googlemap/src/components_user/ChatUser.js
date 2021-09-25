import { useEffect, useState } from 'react';
import axios from "axios";
import { Chat, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-popup';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Url } from '../LinkToBackend';
import getCookie from '../getCookie';


export default function ChatUser(props){
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [avatar,setAvatar] = useState(null)
    const [count,setCount] = useState(0);
    const { conn ,driverId} = props;
    
    useEffect(()=>{
        console.log('--------------',driverId)
        conn.onclose = function(e) {
            console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        };
        conn.onmessage = function(e) {
            
            let Message = JSON.parse(e.data)
            console.log(Message)
            if(Message.message_code =='chat'){
                addResponseMessage(Message.message)
            }
            else if(Message.message_code == 'arrive'){
                props.handleForUpdate(2);
            }
        };
        return ()=>{
        }

    },[])

    useEffect(()=>{
        let intervalId = setInterval(()=>{
            axios.post(Url.LinkToBackend +"backend/api/request_driver_info", {
                driver_id: props.driverId,
                JWT :`${getCookie('token')}`
            
            })
                .then(res=>{
                    if(res.data.auth_code === false){
                        axios.post(Url.LinkToBackend+"backend/api/logout_user",{
                          username: localStorage.getItem("username")
                        }).then(()=>{
                          localStorage.clear();
                          localStorage.setItem("Auth","failed");
                          window.location.reload();
                        })
                    }
                    else{
                        // console.log(res.data)
                        clearInterval(intervalId);
                        setFirst_name(res.data.fname);
                        setLast_name(res.data.lname);
                        setAvatar(res.data.image);
                    }
                })
                .catch(err=>{
                    NotificationManager.error('ขออภัยในความไม่สะดวก','การเชื่อมต่อมีปัญหา',1000);
                })
        },1200)
        
    },[])
    
    
    function handleNewUserMessage(newMessage){
        console.log(`New message incomig! ${newMessage}`);
        // Now send the message throught the backend API
        conn.send(JSON.stringify({
            protocol: "chat", // protocol
            ReceiverName: `${first_name} ${last_name}`, // name
            Message: newMessage,
            ReceiverID: `${driverId}`,
            ReceiverMode: `1` // ระบุ customer หรือ driver (ไม่ใช่ของบุคคล)
        }));
    }
    return(
        <div key={driverId}>
            <Chat
                
                handleNewUserMessage={handleNewUserMessage}
                profileAvatar={avatar}
                title={first_name+' '+last_name}
                subtitle="And my cool subtitle"
               
            />
        </div>
    );
}