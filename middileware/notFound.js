const notFound = (req,res)=>{
    res.status(404).send('Router does not exit')
}


module.exports = notFound