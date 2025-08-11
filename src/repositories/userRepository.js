const { User, AdminUser} = require('../models/User');

class UserRepository {
    /**
     * Role'e göre kullanıcı oluştur
     * @param {string} role 'user' veya 'admin'
     * @param {object} data kullanıcı verisi
     */
    async createByRole(role, data) {
        if(role =='admin'){
            return await AdminUser.create(data);
        }
        //normal kullanıcı 
        return await User.create(data);
    }

    /**E-posta ile kullanıcı bul (login için password alanı dahil) */
    async findByEmailWithPassword(email){
        return await User.findOne({email}).select('+password');
    }

    /**E-posta ile kullanıcı bul (password olmadan) */
    async findByEmail(email){
        return await User.findOne({email});
    }

    /**ID ile kullanıcı bul (password olmadan) */
    async findById(id){
        return await User.findById(id);
    }
}

module.exports = new UserRepository();