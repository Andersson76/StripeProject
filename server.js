import express from 'express'
import fetch from 'node-fetch'


const app = express()
const port = 3000

app.use(express.json()) 
app.use("/", express.static("client"))




app.use((err, req, res, next) => {
    console.log(err.status)
    console.log(err.message)
    res.status(500).json(err)
  })
  
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  })