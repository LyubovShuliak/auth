import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// module.exports = client.db("users", { retryWrites: true });
export const userDatabase = mongoose.model('User', userSchema);
