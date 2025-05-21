
import { Request,Response } from "express";

export const login = (req:Request,res:Response)=>{
    try{
        

    }catch(error:any){
        res.status(500).json({status:500,message:"Internal Server Error"})
        console.log(error)
        return;
    }
}