import './QueueDriver.css'
import React,{ useEffect , useState } from 'react';
import leaveQueue from './LeaveQueue';
import axios from 'axios';
import { Url } from '../../LinkToBackend';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import getCookie from '../../getCookie';


export default function QueueDriver(props) {
    const {conn } = props;
    // ------------------ฟังชันเมื่อ driver ถึง queue แรก------------------------
    function firstQueue() {
        
        //  ------------------ driver เอาข้อมูลของ user ผ่าน api check_booking--------------------
        axios.post(Url.LinkToBackend +"backend/api/check_booking",{
            // driver_id : props.driverId,
            JWT :`${getCookie('token')}`
        })
        .then( res=>{
            console.log(res.data);
            // console.log(typeof(res.data.message));
            
            // console.log(res.data.message);
            if(res.data.auth_code === false){
                axios.post(Url.LinkToBackend+"backend/api/logout_driver",{
                  username: localStorage.getItem("username")
                }).then(()=>{
                  localStorage.clear();
                  localStorage.setItem("Auth","failed");
                  window.location.reload();
                })
              }
            else{
                if (res.data.message){
                    clearInterval(window.timeoutId1);
                    // console.log(Number(res.data.lat_user));
                    props.handleForUpdate(Number(res.data.lat_user), Number(res.data.lng_user),Number(res.data.lat_des) ,Number(res.data.lng_des)
                    ,0 ,res.data.user_id, res.data.user_fname, res.data.user_lname,res.data.image);
                }
            }

        })
        .catch(err=>{
            NotificationManager.error('ขออภัยในความไม่สะดวก','การเชื่อมต่อมีปัญหา',1000);
        })
        
        
    }

    //--------------------------function แสดง queue ของ driver ทั้งหมด --------------------------
    function showQueue(Message){
        if( !!! document.getElementById('queueList')){
            return;
        }
        let i=1;
        let queueList = document.querySelector('#queueList');
        document.getElementById('queueList').innerHTML='';
        
        for (let key in Message) {
            
            if(key != 'message_code'){
                // console.log(key)
                // console.log(Message[key])
                // console.log(props.driverId)
                let myEl = document.createElement('span');
                myEl.innerText = `${i} : ${Message[key].driver_name}  \n`;
                queueList.appendChild(myEl);
                
                if(key==0 && Number(Message[key].driver_id) === props.driverId){
                    firstQueue();
                }
                // if (i==1 && val.driver_id==props.driverId){
 
                //     firstQueue();
                // }
                // else{
                    
                // }
                i++;
            }
        }
        
        
    }
    
    
    

    useEffect(()=>{
        conn.send(JSON.stringify({
            protocol: "getqueue", // protocol
            DriverID: `${props.driverId}`, // name
        }))
        conn.onmessage = function(e) {
            let Message = JSON.parse(e.data)
            console.log(Message)
            clearInterval(window.timeoutId1);
           
            if(Message.message_code ==='queue' || Message.message_code =='empty_queue'){
                // console.log(Message.message_code);
                window.timeoutId1 = setInterval(()=>{showQueue(Message);},1000)
                
                // console.log(sizeof(Message));
            }
            if(Message.message_code ==='user-cancel'){
                console.log(Message.message_code)
                props.cancelCase();
            }
            
    
        };
        
        return ()=>{
            clearInterval(window.timeoutId1);
        }
    },[]);

    // ------------------เมื่อdriverกดปุ่มเข้าคิว----------------------
    function enQueue() {
        
        conn.send(JSON.stringify({
            protocol: "enqueue", // protocol
            DriverID: `${props.driverId}`,
        }))
        
    }
 

    return(
        <div className="queue-container">
            <h4>ตารางคิว</h4>
            <div className="queue-list" id="queueList"></div>
            <div className="button-queue">
                <button  className="button-enQueue" onClick={enQueue}> เข้าคิว </button>
                <button className="button-leaveQueue" onClick={()=>{leaveQueue(props.driverId,conn); }}> ออกคิว </button>
            </div>
            
        </div>
    )
}