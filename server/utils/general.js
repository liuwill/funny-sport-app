const crypto = require('crypto')

const getIp = (header) => {
    if (!header) {
        header = {}
    }

    let ip = header['x-real-ip'] || ''
    ip = ip && ip.split(',')[0]
    const isRealIp = (/^\d+\.\d+.\d+.\d+$/).test(ip)

    if (!isRealIp) { ip = '127.0.0.1' }

    return ip
}

const decryptData = function (appId, sessionKey, encryptedData, iv) {
    // base64 decode
    sessionKey = new Buffer(sessionKey, 'base64')
    encryptedData = new Buffer(encryptedData, 'base64')
    iv = new Buffer(iv, 'base64')

    try {
        // 解密
        var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true)
        var decoded = decipher.update(encryptedData, 'binary', 'utf8')
        decoded += decipher.final('utf8')
        decoded = JSON.parse(decoded)
    } catch (err) {
        console.log(err)
        throw new Error('Illegal Buffer')
    }

    if (decoded.watermark.appid !== appId) {
        throw new Error('Illegal Buffer')
    }

    return decoded
}

const pickCurrentStep = (runData) => {
    let todayStr = new Date().toLocaleDateString()
    runData.current = 0

    if (runData.stepInfoList && runData.stepInfoList.length) {
        const lastPos = runData.stepInfoList.length - 1
        const lastOne = runData.stepInfoList[lastPos]

        const lastDate = new Date(lastOne.timestamp * 1000).toLocaleDateString()
        if (todayStr === lastDate) {
            runData.current = lastOne.step
        }
    }
    return runData.current
}

module.exports = {
    getIp,
    decryptData,
    pickCurrentStep
}
