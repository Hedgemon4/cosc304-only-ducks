const sql = require('mssql');

const auth = {
    checkAuthentication: function (req, res) {
        let authenticated = false

        if (req.session.authenticatedUser) {
            authenticated = true
        }

        if (!authenticated) {
            let url = req.protocol + '://' + req.get('host') + req.originalUrl
            let loginMessage = "You have not been authorized to access the URL " + url
            req.session.loginMessage = loginMessage
            res.redirect("/login")
        }

        return authenticated
    },
    checkAdmin: function (req, res){
        let isAdmin = false
        if(req.session.isAdmin){
            isAdmin = true
        }

        if(!isAdmin){
            let url = req.protocol + '://' + req.get('host') + req.originalUrl
            let loginMessage = "You have not been authorized to access the URL " + url
            req.session.loginMessage = loginMessage
            res.redirect("/login")
        }

        return isAdmin
    }
}

module.exports = auth
