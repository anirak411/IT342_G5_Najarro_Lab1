import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/global.css";

function Profile(){
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const[listing, setListing] = useState("") // ilisan ug item

    /* name can be changed, but not email
       must include profile pic
       listings should be visible
    */
}