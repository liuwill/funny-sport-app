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

module.exports = {
    getIp
}
