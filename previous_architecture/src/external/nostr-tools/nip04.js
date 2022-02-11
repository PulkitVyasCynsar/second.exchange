import aes from 'browserify-cipher'
import {Buffer} from 'buffer'
import {randomBytes} from '@noble/hashes/utils'
import * as secp256k1 from '@noble/secp256k1'

export function encrypt(privkey, pubkey, text) {
  const key = secp256k1.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getOnlyXFromFullSharedSecret(key)

  let iv = Uint8Array.from(randomBytes(16))
  var cipher = aes.createCipheriv(
    'aes-256-cbc',
    Buffer.from(normalizedKey, 'hex'),
    iv
  )
  let encryptedMessage = cipher.update(text, 'utf8', 'base64')
  encryptedMessage += cipher.final('base64')

  return [encryptedMessage, Buffer.from(iv.buffer).toString('base64')]
}

export function decrypt(privkey, pubkey, ciphertext, iv) {
  const key = secp256k1.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getOnlyXFromFullSharedSecret(key)

  var decipher = aes.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(normalizedKey, 'hex'),
    Buffer.from(iv, 'base64')
  )
  let decryptedMessage = decipher.update(ciphertext, 'base64')
  decryptedMessage += decipher.final('utf8')

  return decryptedMessage
}

function getOnlyXFromFullSharedSecret(fullSharedSecretCoordinates) {
  return fullSharedSecretCoordinates.substr(2, 64)
}
