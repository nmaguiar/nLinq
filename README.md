# nLinq

![Build](https://github.com/nmaguiar/nLinq/workflows/Build/badge.svg)

Aims to be a replacement to the old [jLinq](https://github.com/hugoware/jLinq) providing most of the functionality hopefully faster than the original.

The aim is provide JavaScript abstraction over different ways of "querying" arrays of maps/objects.

Examples:

````javascript
// How many contacts there are with email ending in @domain.com
_from( arrayOfContacts )
.ends("email", "@domain.com")
.count();

// Sort all contacts in @domain.com by first name and last name
_from( arrayOfContacts )
.ends("email", "@domain.com")
.sort("firstName", "lastName")
.select()
````

Althought some code (OpenAFSigil) is borrowed from [OpenAF](https://github.com/openaf/openaf) it will be released for both in browser use and in OpenAF use.

---

## Currently not implemented comparing jLinq

This is not an exaustive list by just to provide a heads-up on what is still missing:

### Methods

* except(array)
* intersect(array)
* union(array)
* skipWhile(fn)
* takeWhile(fn)

### Functionality

* Parameter arrays to apply functions over values.

## To be implemented extra

### Methods

* merge(array)
