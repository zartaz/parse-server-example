module.exports = function (req, res, next) {
    console.log(req.query);
    next();
};