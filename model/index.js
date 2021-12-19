const fs = require('fs/promises')
const { v4 } = require('uuid')
const contactsPath = require('./contactsPath')

const listContacts = async () => {
  const data = await fs.readFile(contactsPath)
  const contacts = JSON.parse(data)
  return contacts
}

const getContactById = async (id) => {
  const contacts = await listContacts()
  const data = contacts.find(contact => String(contact.id) === id)
  if (!data) {
    return null
  }
  return data
}

const removeContact = async (id) => {
  const contacts = await listContacts()
  const idx = contacts.findIndex((item) => String(item.id) === id)
  if (idx === -1) {
    return null
  }
  const removedContact = contacts.splice(idx, 1)
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
  return removedContact
}

const addContact = async (body) => {
  const newContact = { id: v4(), ...body }
  const contacts = await listContacts()
  contacts.push(newContact)
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
  return newContact
}

const updateContact = async (id, body) => {
  const contacts = await listContacts()
  const idx = contacts.findIndex((item) => String(item.id) === id)
  if (idx === -1) {
    return null
  }
  contacts[idx] = { id: id, ...body }
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
  return contacts[idx]
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
