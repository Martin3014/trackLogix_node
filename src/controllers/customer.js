'use strict'

const Customers = require('../models/customers')
const Packages = require('../models/packages')
const { checkPassword, encrypt, validateData } = require('../utils/validate')
const { createToken } = require('../services/jwt')
const { compare } = require('bcrypt')
require('sequelize')


exports.test = async(req, res) => {
    try{
        return res.send({message: 'Test is running'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error general'})
    }
}

exports.login = async(req, res) => {
    try{
        let data = req.body
        if(!data.email || data.email == '' || !data.password || data.password == '') return res.status(400).send({message: 'The passoword and email are required'})
        let customerCredentials = await Customers.findOne({
            where: {
                email: data.email,
            }

        })
        if(!customerCredentials) return res.status(404).send({message: 'Email not registred'})
        if(customerCredentials && await checkPassword(data.password, customerCredentials.password)){
            console.log('Password match!');
            let token = await createToken(customerCredentials)
            return res.send({ message: 'User logged succesfully', token})
        }else{
            console.log('Password mismatch or user not found');
            return res.status(404).send({ message: 'Invalid Credentials' });
        }
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error creating accout', err})
    }
}

const generateRandomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let code = '';
    
    for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    for (let i = 0; i < 3; i++){
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return code;
};

exports.register = async(req, res) => {
    try{
        let data = req.body
        if(!data.name || data.name == '' || !data.surname || data.surname == '' || !data.email || data.email == '' ||
            !data.password || data.password == '') return res.status(402).send({message: 'This params are requerited'}); 
        let emailExist = await Customers.findOne({
            where: {
                email: data.email
            }
        })
        if(emailExist) return res.status(401).send({message: 'Email already exist'})
        data.password = await encrypt(data.password)
        const newCustomer = await Customers.create({
            name: data.name,
            surname: data.surname,
            code: generateRandomCode(),
            email: data.email,
            phone: data.phone,
            password: data.password
        });

        return res.status(201).send({ message: 'Customer registered successfully', customer: newCustomer});
    }catch(err){
        console.log(err)
        return res.status(500).send({message: 'Error in the register', err})
    }
}

exports.getYourInfo = async(req, res) => {
    try{
        let customerId = req.user.sub
        let customerExist = await Customers.findOne({
            where:{
                id: customerId
            },
            attributes: {
                exclude: ['password', 'id']

            }
        })
        if(!customerExist) return res.status(404).send({message: 'Customer not found'})
        return res.send(customerExist)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting your info', err})
    }
}

exports.getYourPackages = async(req, res) => {
    try{
        let customerId = req.user.sub
        let packages = await Packages.findAll({
            where: {
                status_id: customerId
            },
            attributes: {
                exclude: ['id']
            }
        })
        if(packages.length == 0) return res.status(202).send({message: 'You dont have packages'})
        return res.send(packages)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting your packages'})
    }
}

exports.updatePassword = async(req, res) => {
    try{
        let customerId = req.user.sub
        let customerRouteId = req.params.id
        let data = req.body
        let params = {
            before: data.before,
            after: data.after
        }

        let msg = validateData(params)
        if(customerId != customerRouteId) return res.status(403).send({message: 'You cant edit this user'})
        if(msg) return res.status(400).send({ msg });
        let customer = await Customers.findOne({
            where: {
                id: customerRouteId
            }
        })

        if(!customer) return res.status(404).send({message: 'Customer not found'})
        params.after = await encrypt(params.after)
        if(await compare(params.before, customer.customer_password)){
            await Customers.update({ customer_password: params.after}, {where: { id: customerRouteId}})
            return res.status(201).send({ message: 'Password was updated' })
        }

        return res.status(401).send({ message: 'Invalid Password' });
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating password'})
    }
}

exports.editYourAccount = async(req, res) => {
    try{
        let data = req.body
        let customerId = req.user.sub
        let params = {
            name: data.name,
            surname: data.surname,
            email: data.email,
            phone: data.phone
        }
        let customerUpdate = await Customers.update({
            name: params.name, surname: params.surname,
            email: params.email, phone: params.phone
        },{ where: { id: customerId } });

        return res.send({ message: 'Account updated', customerUpdate })
        

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error editing your account'})
    }
}
//test
exports.deleteAccount = async(req, res) => {
    try{
        let customerId = req.user.sub
        let existCustomer = await Customers.findByPk(customerId)
        if(!existCustomer) return res.status(404).send({message: 'Account not found'})
        let hasPackage = await Packages.findAll({
            where: {
                customer_id: customerId
            }
        })
        if(hasPackage.length != 0) return res.status(400).send({message: 'You cannot delete your account because you have a pending package'})
        await existCustomer.destroy()
        return res.send({message: 'Account delete succesfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting yor account'})
    }
}


