const crypto = require('crypto')

const generateHexTimeStamp = () => {
    let length = 8
    let currentSecond = Date.now() / 1000
    let timestamp = parseInt(currentSecond, 10) % 0xFFFFFFFF

    timestamp = timestamp.toString(16)
    return (timestamp.length === length) ? timestamp : '00000000'.substring(timestamp.length, length) + timestamp
}

const generateSerialId = () => {
    const generatedShareId = Math.random()
    const currentTime = Date.now()

    const secret = crypto.createHash('md5').update(`${generatedShareId}-${currentTime}`).digest('hex')
    const shortSecret = secret.substr(8, 16)
    const timestamp = generateHexTimeStamp()
    return `${timestamp}${shortSecret}`
}

module.exports = {
    generateSerialId,
    ORDER_STATUS: {
        CREATED: 0,
        PAID: 1,
        FINISHED: 2,
        CANCEL: 3,
        ERROR: 4,
        FAIL: 5,
        FILED: 10
    },
    GOODS_ITEM_STATUS: {
        CREATED: 0,
        PUBLISHED: 10,
        HIDDEN: 2,
        DELETED: 40
    }
}
