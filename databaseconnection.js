// const mongoose=require("mongoose");

// main().then(()=>{     //promise
//     console.log("connection successfully")
// }).catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/carpoolsystem');

// }
const mongoose = require('mongoose');
const uri = "mongodb+srv://mukulchauhan7407:5HN5DcLH6D4a2Qrx@cluster0.edzslkm.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await mongoose.disconnect();
  }
}
run().catch(console.dir);
 
