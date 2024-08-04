import { connect } from "mongoose";

const MONGO_URL = "mongodb+srv://vig6604:vignesh123@cluster0.npb41as.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await connect(MONGO_URL);

}
