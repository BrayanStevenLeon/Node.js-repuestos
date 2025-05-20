// middlewares/usuarioActual.js
module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        req.usuarioActual = req.session.user;
    }
    next();
};
