const { userModel } = require("../Model/userModel");
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const nodemailer = require("nodemailer")
const _ = require("lodash")
require('dotenv').config()
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET 
  });

  var transporter = nodemailer.createTransport({
    service: 'smtp@gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
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
                        const form = new userModel({username, email, password, profile_picture, resetLink: ""})
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

const forgotPassword=(req, res)=>{
    const {email} = req.body
    userModel.findOne({email}, (err, user)=>{
        if(err){
            res.status(500).send({message: 'Internal server error!', status: false})
        }
        else{
            if(!user){
            res.status(200).send({message: 'User with this email does not exist!', status: false})
            }
            else{
                const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'})
                const mailMessage = {
                    from: "noreply@example.com",
                    to: email,
                    subject: "Account Activation Link",
                    html: `<h2>Please click on the given link to reset your password</h2>
                    <p>${process.env.CLIENT_URL}/reset_password/${token}</p>
                    `
                }

                return user.updateOne({resetLink: token}, (err, success)=>{
                        if(err){
                            res.status(500).send({message: "Reset password link error", status: false})
                        }
                        else{
                            transporter.sendMail(mailMessage, (err, bodyDetail)=>{
                                if(err){
                                    res.status(500).send({message: "Internal server error", status: false})
                                }
                                else{
                                    res.status(200).send({message: "Verification link to reset your password has been sent to the email you entered, Kindly follow the instructions, the link will expire in the next 20minutes", status: true})
                                }
                            })
                        }
                })
            }
        }

    })
}
const resetPassword =(req, res)=>{
    const { resetLink, newPassword } = req.body
    if(resetLink){
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decoded)=>{
                if(err){
                    res.status(200).send({message: "Incorrect token or it has been expired", status: false})
                }
                else{
                    userModel.findOne({resetLink}, (err, data)=>{
                        if(err){
                            res.status(500).send({message: "Internal server error", status: false})
                        }
                        else{
                            const obj = {password: newPassword, resetLink: ""}
                            const user = _.extend(data, obj)
                            user.save((err)=>{
                                if(err){
                                    res.status(500).json({message: `Internal server error, please check your connection`, status: false})
                                }else{
                                    res.status(200).json({message: `Your password has been updated successfully, proceed to login with your new password`, status: true})
                                }
                            })
                        }
                    })
                }
            })
    }
    else{
        res.status(401).send({message: "Unexpected error, please check your email to activate", status: false})
    }
}


//using mailgun-js to send email
//what is express jwt
//install lodash
module.exports = {register, login, chatHome, allUsers, uploadPhoto, forgotPassword, resetPassword}