const { userModel } = require("../Model/userModel");
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
require('dotenv').config()
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET 
  });
const register = (req, res)=>{
   const {username, email, password, profile_picture} = req.body;

   userModel.findOne({'username': username}, (err, result)=>{
    if(err){
        res.json({message:`Internal server error!`, status: false});
    }else{
        if(result){
            res.json({message: `Username entered is already used`, status: false})
        }else{
            userModel.findOne({'email': email}, (err, result)=>{
                if(err){
                    res.json({message: ` internal server error!`, status: false});
                }else{
                    if(result){
                        res.json({message: `Email entered is already used`, status: false})
                    }
                    else{
                        const form = new userModel({username, email, password, profile_picture})
                        form.save((err)=>{
                            if(err){
                                res.json({message: `Internal server error, please check your connection`, status: false})
                            }else{
                                res.json({message: `User registered successfully`, status: true})
                            }
                        })
                    }
                }
            })
        }
    }
   })
}

const login =(req, res)=>{
    const {username, password} = req.body
    userModel.findOne({'username': username}, (err, userExist)=>{
        if(err){
            res.json({message: `Internal server error`, status: false})
            console.log(`internal server error`);
        }
        else{
            if(userExist){
                userExist.validatePassword(password, (err, same)=>{
                    if(err){
                        res.json({message: `Internal server error! please check your connection...`, status: false})
                    }
                    else{
                        if(same){
                            const token = jwt.sign({ username }, process.env.JWT_SECRET, {expiresIn: '4h'})
                            res.json({token, status: true})
                        }
                        else{
                            res.json({message: `password entered is not correct, please check and try again`, status: false})
                        }
                    }
                })
            }
            else if(!userExist){
                res.json({message: `This user details is not found! please kindly create account!`, status: false})
            }
        }
    })
}

const chatHome=(req, res)=>{
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, result)=>{
        if(err){
            res.json({message: `internal server error. please check your connection!`, status: false})
        }
        else{
            userModel.findOne({username: result.username}, (err, thisUser)=>{
                if(err){
                    res.json({message: `Internal server error. please check your connection.`, status: false})
                }
                else{
                    res.json({thisUser, status: true})
                }
            })
        }
    })
}

const allUsers=(req, res)=>{
    const userId = req.params.id
    userModel.find((err, allUsers)=>{
        if(err){
            res.json({message: `Internal server error, please check your internet connection!`, status: false})
        }
        else{
            let allUser = allUsers.filter((user)=>user._id != userId)
            res.json({allUser, status: true})
        }
    })
}

const uploadPhoto =(req, res)=>{
   const { id, fileUrl } = req.body
    cloudinary.v2.uploader.upload(fileUrl, (err, data)=>{
        if(err){
            res.json({message: 'Error in uploading photo, try again!', status: false})
        }
        else{
            userModel.findByIdAndUpdate({_id: id}, {$set: {'profile_picture': data.secure_url}}, (err, data)=>{
                if(err){
                    res.json({message: 'Error occurred in updating profile picture', status: false})
                }
                else{
                    res.json({message: 'uploading successfull', status: true})
                }
            })
        }
    })

}
module.exports = {register, login, chatHome, allUsers, uploadPhoto}