const express=require("express");
const app=express();
let port= process.env.PORT|| 8080;
const path =require("path");
const databaseconnection=require("./databaseconnection");
const userregistration=require("./models/userregistration");
const Publish= require("./models/publish");
const ejsMate = require("ejs-mate");
const publishersignup=require("./models/publisherregistration")
const session = require('express-session');
const bodyParser = require('body-parser');
const booking =require("./models/booking");
const methodOverride= require("method-override");
const nodemailer = require('nodemailer');

// Create a transporter using SMTP transport

const transporter = nodemailer.createTransport({
  service: "outlook", // Change the service to "outlook"
  host: 'smtp-mail.outlook.com', // Outlook SMTP host
  port: 587, // Outlook SMTP port
  secure: false, // Set to true if your SMTP host uses TLS
  auth: {
    user: 'mukulchauhan7404@outlook.com', // Your Outlook email address
    pass: 'Mukul@123' // Your Outlook email password or app-specific password
  }
});
 

app.listen(port,()=>{
    console.log("server is listing on port number 8080");

});
app.use(bodyParser.json());
app.use(session({
  secret: 'mukul',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 3600000 } // 1 hour in milliseconds
}));

app.set("view engine","ejs");
app.engine("ejs",ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

function requireLogin(req, res, next) {
  //console.log(req.session.user)
  if ( req.session.user) {
      return next();
  } else {
      return res.status(401).redirect('/login');
  }
}

function requireLoginp(req, res, next) {
  //console.log(req.session.user)
  if ( req.session.publisher) {
      return next();
  } else {
      return res.status(401).redirect('/login-publisher');
  }
}


app.get("/",(req,res)=>{
        res.render("home.ejs");
});
app.get("/about",(req,res)=>{
  res.render("about_us.ejs");
})
app.get("/contact",(req,res)=>{
  res.render("contact_us.ejs");
})
app.get("/services",(req,res)=>{
  res.render("services.ejs");
})
app.get("/help",(req,res)=>{
  res.render("help.ejs");
})
  
  app.get("/login",(req,res)=>{
       if(req.session.user)
       res.redirect(`/userprofile/${req.session.user._id}`)
      else
      res.render("login.ejs");
  })
  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Find the user by their email
        const user = await userregistration.findOne({ email: username });

        if (user) {
            // Compare passwords
            if (user.passward === password) {
                req.session.user = user; // Attach user data to the session
                //console.log("User logged in:", req.session); // Add this line for debugging
                 res.redirect(`/userprofile/${user._id}`);
            } else {
                return res.send("Password is incorrect");
            }
        } else {
            return res.send("User not found");
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/userprofile/:id",requireLogin ,async (req, res) => {
  try {
    let id = req.params.id; 
    let userdata = await userregistration.findById(id);
    console.log(id);
    let d =userdata.dateofbrith;
    let dob =new Date(d);
    let year = dob.getFullYear();
let month = dob.getMonth() + 1; // Month is zero-based, so adding 1 to get the correct month
let day = dob.getDate();
let date = `${month}/${day}/${year}`;

    res.render("profile.ejs",{userdata,date});
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
  app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})
app.post("/signup", async (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
      console.log(req.body.sign)
       const user =new userregistration(req.body.sign);
       await user.save();
      res.redirect("/login")
 //s.send(`Signing up with username: ${email} and password: ${password}`);
});

//route for publish
app.get("/publish", requireLoginp,(req,res)=>{

  res.render("publish.ejs");
});



app.get("/search",(req,res)=>
{
  res.render("search.ejs");
})

// app.post("/search",async (req,res)=>
// {
//   console.log(req.body.se);
//   const data=req.body.se;
 
//    try{
//     let vahans = await Publish.find({from:data.from,to:data.to,date:data.date});
//     if(vahans)
//        res.render("show.ejs",{vahans});
//     else
//        res.send("not found");
//        console.log(vahans);
//     }
//    catch{
       
//    }
 
// })


app.post("/search",async (req,res)=>
{
  console.log(req.body.se);
  const data=req.body.se;
 
   try{
    let vahans = await Publish.find({from:data.from,to:data.to,date:data.date});
    let count = vahans.length;
    console.log(count);
    if(count>0){
      let d = vahans[0].date;
     let date= d.toString().slice(0,15);
      res.render("show.ejs",{vahans,count,date}); 
    }
    else
       res.send("not found");
       console.log(vahans);
    }
   catch (error) {
    console.error(error);
    // Handle the error appropriately, maybe send an error response
    res.status(500).send("Internal Server Error");
  }
 
})

app.get("/login-publisher",(req,res)=>{
  if(req.session.publisher)
  res.redirect(`/publisherprofile/${req.session.publisher._id}`)
else
  res.render("./publisherlogin.ejs");
})

app.get("/publisher-signup",(req,res)=>{
  res.render("./publishersignup.ejs");
})
let publishid;
app.get("/book" ,requireLogin,(req,res)=>{
  publishid=req.query.vahanId;
  res.render("./book.ejs")
})

app.post('/publisher-signup', async (req, res) => {
  try {
    // Create a new SignUp document with form data
    const signUpData = new publishersignup(req.body.sign);
    // Save the document to the database
    await signUpData.save();
    res.redirect('/login-publisher');
  } catch (error) {
    res.status(400).send('Error in sign up: ' + error.message);
  }
});



app.post("/publisherlogin",async (req,res)=>{
  const username = req.body.username;
const password = req.body.password;
 console.log(username);
 console.log(password);
//const indatabase= await userregistration.find({email:username});
//console.log(indatabase[0].passward);

try {
  // Find the user by their email
  const user = await publishersignup.findOne({ email: username });

  if (user) {
      // Compare password
      console.log(user.password)
      if (user.password === password) {
          req.session.publisher = user; // Attach user data to the session
          //console.log("User logged in:", req.session); // Add this line for debugging
           res.redirect(`/publisherprofile/${user._id}`);
      } else {
          return res.send("Password is incorrect");
      }
  } else {
      return res.send("User not found");
  }
} catch (error) {
  console.error("Error during login:", error);
  return res.status(500).send("Internal Server Error");
}
     
});


app.get("/publisherprofile/:id", requireLoginp,async(req,res)=>{

  try {
    let {id} = req.params; 
    let userdata = await publishersignup.findById(id);
    
    res.render("publisherprofile.ejs",{userdata});
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
)


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});


app.post("/publish",requireLoginp,async (req,res)=>{
  console.log(req.body.pub)
       let pub =new Publish(req.body.pub);
       //await pub.save();
       let usr=await publishersignup.findById(req.session.publisher._id);
       pub.publisherid=usr
       usr.publishes.push(pub);
       usr=await usr.save();
       pub =await pub.save();
       console.log(usr);
       console.log(pub);
      res.redirect(`/publisherprofile/${usr._id}`)
    
})

app.post("/confirm", requireLogin, async (req, res) => {
  try {
      const publish = await Publish.findById(publishid);
      if (!publish) {
          return res.status(404).send("Publish not found");
      }

      let bg = new booking(req.body.pub);
      bg.publish = publish;
      bg.user = req.session.user;
      bg = await bg.save();
      req.session.user.booking.push(bg)
      let ur = await userregistration.findById(req.session.user._id);
      if (!ur) {
          return res.status(404).send("User not found");
      }
      ur.booking.push(bg);
      await ur.save();

      let publisher = await publishersignup.findById(publish.publisherid);
      if (!publisher) {
          return res.status(404).send("Publisher not found");
      }
      publisher.booking.push(bg);
      await publisher.save();

      res.redirect(`/userprofile/${req.session.user._id}`)
  } catch (error) {
      console.error("Error in /confirm route:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.get("/userrequests", requireLogin, async(req, res) => {
  try {
    const book = req.session.user.booking;
   console.log(book)
    let reqbook = [];
    for (t of book) {
      try {
        let bk = await booking.findById(t);
        if (bk && bk.status === 0) {
          reqbook.push(bk);
        }
      } catch (error) {
        console.error("Error finding booking:", error);
      }
    }
    console.log("Requested Bookings:", reqbook);
    if(!reqbook)
    res.send("There are no pending requests")
  else
    res.status(200).render("userrequest.ejs",{reqbook});
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/userconfirmed", requireLogin, async (req, res) => {
  try {
    const book = req.session.user.booking;
    let reqbook = [];
    for (t of book) {
      try {
        let bk = await booking.findById(t);
        if (bk && bk.status === 1) {
          reqbook.push(bk);
        }
      } catch (error) {
        console.error("Error finding booking:", error);
      }
    }
    console.log("Requested Bookings:", reqbook);
    if(!reqbook)
    res.send("There are no pending requests")
  else
    res.status(200).render("userconfirmed.ejs",{reqbook});
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/publisherequests", requireLoginp, async (req, res) => {
  try {
    const book = req.session.publisher.booking;
    let reqbook = [];
    for (t of book) {
      try {
        let bk = await booking.findById(t);
        if (bk && bk.status === 0) {
          reqbook.push(bk);
        }
      } catch (error) {
        console.error("Error finding booking:", error);
      }
    }
    console.log("Requested Bookings:", reqbook);
    res.status(200).render("publisherrequest.ejs",{reqbook});
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/publisherconfirmed", requireLoginp, async (req, res) => {
  try {
    const book = req.session.publisher.booking;
    let reqbook = [];
    for (t of book) {
      try {
        let bk = await booking.findById(t);
        if (bk && bk.status === 1) {
          reqbook.push(bk);
        }
      } catch (error) {
        console.error("Error finding booking:", error);
      }
    }
    console.log("Requested Bookings:", reqbook);
    res.status(200).render("publisherconfirmed.ejs",{reqbook});
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/usercancel/:id",requireLogin,async(req,res)=>{
  const bookid=req.params.id;
  console.log(bookid)
await booking.findByIdAndDelete(bookid);

res.redirect("/userrequests")

  
})

 

app.put("/publisheraccept/:id", requireLoginp, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedBooking = await booking.findByIdAndUpdate(id, { status: 1 }, { new: true });
     const temp =await booking.findById(id);
     const t=await Publish.findById(temp.publish);
     const te=await publishersignup.findById(t.publisherid);
     req.session.publisher=te;
       const usr=await userregistration.findById(temp.user);

     
    if (updatedBooking) 
    {
      console.log('Booking status updated successfully:', updatedBooking);
      const mailOptions = {
        from: 'mukulchauhan7404@outlook.com', // Sender address
        to: usr.email, // Receiver address
        subject: 'confirmed your booking on logitrack', // Subject line
        text: ` booking confirmed  And owner cantact mobile number is ${te.mobilenumber}`, // Plain text body
    
      }
    
     await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).send("Error sending email");
        } else {
          console.log('Email sent:', info.response);
          //res.status(200).send("Email sent successfully");
        }
      });
      res.status(200).redirect("/publisherequests"); // Optionally, send back the updated booking as response
    } else {
      console.log('No booking found with the provided ID.');
      res.status(404).json({ message: 'Booking not found' });
    }

   

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

 





const generateOTP = () => {
  // Generate a random number between 100000 and 999999 (6 digits)
  return Math.floor(100000 + Math.random() * 900000);
};

const otpStorage = [];


app.post('/sendOTP', requireLoginp,async(req, res) => {
    const { user } = req.body;
    console.log(user)
    const bk=await booking.findById(user)
    const userdata=await userregistration.findById(bk.user);

    //console.log(userdata);
   
    const generatedOTP = generateOTP()  //otp.totp({ digits: 6 });
    const mailOptions = {
      from: 'mukulchauhan7404@outlook.com', // Sender address
      to: userdata.email, // Receiver address
      subject: 'OTP to start ', // Subject line
      text: ` Otp to start ride on logitrack ${generatedOTP}`, // Plain text body
  
    }
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send("Error sending email");
      } else {
        console.log('Email sent:', info.response);
        //res.status(200).send("Email sent successfully");
      }
    });
    console.log(userdata.email)
    otpStorage[userdata.email] = {
      otp: generatedOTP,
      timestamp: Date.now() // Store the timestamp when OTP was generated
  };
   const email=userdata.email;
   //console.log(email)
   console.log(otpStorage[email])
    res.status(200).render("takingotp.ejs",{email:email,booking:bk});
});

// Function to verify OTP
const verifyOTP = (email, userInput) => {
  console.log(email)
  console.log(userInput)

    const storedOTP = otpStorage[email];

    console.log(storedOTP)
    if (!storedOTP) {
        return false; // OTP not found
    }
   
    const { otp, timestamp } = storedOTP;
    console.log(otp)
    const currentTime = Date.now();

    // Check if OTP is expired (10 minutes in milliseconds)
    if (currentTime - timestamp > 10 * 60 * 1000) {
        delete otpStorage[email]; // Remove expired OTP
        return false; // OTP expired
    }

    if (Number(otp) === Number(userInput))

       return true; // Compare OTPs
};

// Endpoint to verify OTP
app.post('/verifyOTP', requireLoginp,async(req, res) => {
    const { email, otp,bookingid } = req.body;
    console.log(email)
    console.log(otp)
    console.log(bookingid)
     
     
    if (verifyOTP(email, otp)) {
        delete otpStorage[email]; // Remove verified OTP
      //  console.log(bkk.drop_point)
        res.redirect(`/route/${bookingid}`);
    } else {
        res.status(400).send('Invalid OTP');
    }
});


app.get("/route/:id",requireLoginp,async(req,res)=>{
    
   const id=req.params.id;
   const bkk=await booking.findById(id);
   console.log(bkk.drop_point)
   res.render('map.ejs',{st:bkk.pickup_point,en:bkk.drop_point});
})



app.post("/track",requireLogin,async(req,res)=>{
    
  const {bookingid}=req.body;
  console.log(bookingid)
  const bkk=await booking.findById(bookingid);
  console.log(bkk)
  console.log(bkk.drop_point)
  
  res.render('map.ejs',{st:bkk.pickup_point,en:bkk.drop_point});
})
