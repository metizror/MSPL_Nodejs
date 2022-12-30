const MongoClient = require('mongodb').MongoClient

class mongoConnection {
    // static connectToMongo() {
    //     console.log("======Connection==>")
    //     if ( this.db ) return Promise.resolve(this.db)
    //     return MongoClient.connect(this.url, this.options)
    //         .then(db => this.db = db)
    // }
    // or in the new async world
    static async connectToMongo() {
        console.log("======Connection==>",this.url)
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }
}


mongoConnection.db = null
// mongoConnection.url = `mongodb://localhost:27017/cbl_super_admin`
mongoConnection.url = `mongodb://${config.get('mongoDb.user')}:${config.get('mongoDb.password')}@${config.get('mongoDb.host')}:${config.get('mongoDb.port')}/${config.get('mongoDb.database')}`
// mConnection.url = `mongodb://${config.get('mongoDb.user')}:${config.get('mongoDb.password')}@${config.get('mongoDb.host')}:${config.get('mongoDb.port')}/${config.get('mongoDb.database')}`

mongoConnection.options = {
    bufferMaxEntries:   0,
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { mongoConnection }