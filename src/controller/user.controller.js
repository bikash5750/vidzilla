import { configDotenv } from "dotenv"
import { user } from "../models/user.model.js"
import { uploadtocloudinay } from "../utils/cloudinary.js"

const registerUser = async(req ,res)=>{

  try {
  
    //taking user details
  const{ username , email , fullname , password } = req.body

    //input validation
  if(!username || !email || !fullname || !password){
    return res.status(400).json({
      msg : " not fullfilled user details, eneter full details"
    })
  }

  //find user in db
  const finduser = await user.findOne({
    $or : [{email},{username}]
  })


  //if user found
  if(finduser)
  {
    return res.status(409).json({
      msg : " user already exist please login"
    })
  }

  //if user not found then take img and avatar

  const getavatar = req.files?.avatar?.[0]?.path;  
  const getcoverimg = req.files?.coverimg?.[0]?.path;

  // console.log(avatar)
  // console.log(coverimg)

  // if avatar and coverimg missing
  if(!getavatar || !getcoverimg)
  {
    return res.status(400).json({
      msg : " missing avatar or coverimg"
    })
  }

  const avatar = await uploadtocloudinay(getavatar);
  const coverimg = await uploadtocloudinay(getcoverimg);
  
  if (!avatar || !coverimg) {
    return res.status(500).json({
      msg: "Unable to upload coverimg or avatar to Cloudinary",
    });
  }

  //create new user
  const newuser = new user({
    username,
    email,
    fullname,
    password,
    avatar,  
    coverimg, 
  });
  
  await newuser.save();

  return res.status(200).json({
    msg: "User created successfully",
    data: {
      username,
      email,
      fullname,
      avatar,  
      coverimg,
    },
  });
  

  /// ALL DONE WITH REGISTER USER , NOW TIME FOR LOGIN

 
  } catch (error) {
    return res.status(500).json({
      msg : " server error, unable to create user"
    }
    )
  }
  

};


const userlogin = async (req, res) => {
  try {

    // Take username, password, and email from request body
    const { username, password, email } = req.body;

    // Check if required info is provided
    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "Your data is missing",
      });
    }

    // Check if user exists
    const findUser = await user.findOne({
      $or: [{ username }, { email }],
    });

    // If user is not found
    if (!findUser) {
      return res.status(404).json({
        msg: "User not found. Please register",
      });
    }

    // Compare password
    const isPasswordValid = await findUser.checkpassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        msg: "Incorrect password",
      });
    }

    // Generate access and refresh tokens
    const refreshToken = findUser.generateRefreshToken();
    const accessToken = findUser.generateAccesstoken();

    // Save refresh token in the database
    findUser.refreshtoken = refreshToken;
    await findUser.save({ validateBeforeSave: false });

    //console.log(findUser)

    //can be altered only through backend
    const options = {
      httponly : true,
      secure : true
    }
    // Set cookies and return response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        msg: "Login successful",
        user: {
          username: findUser.username,
          email: findUser.email,
          fullname : findUser.fullname,
          avatar : findUser.avatar,
          coverimg : findUser.coverimg,
          accessToken,
          refreshToken,
        },
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Server error, unable to process request",
    });
  }
};


const logout = async (req, res) => {
  try {
    await user.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshtoken: undefined,
        },
      }
    );

    const options = {
      httponly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options) 
      .clearCookie("refreshToken", options) 
      .json({
        msg: "User logout",
      });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Unable to logout, please try again",
    });
  }
};

export { registerUser, userlogin , logout };
