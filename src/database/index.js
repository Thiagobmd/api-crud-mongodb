const mongoose = require("mongoose");

mongoose.set('useCreateIndex', true);
//criando conexão com o banco de dados
mongoose
  .connect("mongodb://localhost/noderest", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("DB Connected!"))
  .catch((err) => {
    console.log(err.message);
  });

mongoose.Promise = global.Promise;

module.exports = mongoose;
