import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { compare } from "bcrypt";
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        reuired:true,
        unique:true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,
        minLength: 6,
    },
    profileImage:{
        type:String,
        default:"",
    }
});

//Hash password before saving
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function(password){
    return await compare(password, this.password);
}
const User = mongoose.model('User', userSchema)
export default User;