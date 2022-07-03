# nLinq

![Build](https://github.com/nmaguiar/nLinq/workflows/Build/badge.svg)

Aims to be a replacement to the old [jLinq](https://github.com/hugoware/jLinq) providing most of the functionality hopefully faster than the original.

The aim is to provide a declarative JavaScript abstraction over different ways of "querying" arrays of maps/objects.

Examples:

````javascript
// How many contacts there are with email ending in @domain.com
$from( arrayOfContacts )
.ends("email", "@domain.com")
.count();

// Sort all contacts in @domain.com by first name and last name
$from( arrayOfContacts )
.ends("email", "@domain.com")
.sort("firstName", "lastName")
.select()
````

Althought some code (OpenAFSigil) is borrowed from [OpenAF](https://github.com/openaf/openaf) it will be released for both in browser use and in OpenAF use.

Check out the [nLinq reference](Reference.md).

## Using in a browser

Example of using nLinq in a browser:

````html
<html>
 <body>
  <h1>Test nLinq</h1>
  <script src="nLinq/dist/nlinq.js"></script>
  <hr>

  <script> 
    var family = [
      { id: 1, firstName: "John", lastName: "Smith", bornYear: 1982, state: "NY" },
      { id: 2, firstName: "Anne", lastName: "Smith", bornYear: 1985, state: "NY" },
      { id: 3, firstName: "Steve", lastName: "Andrews", bornYear: 1997, state: "CA" },
      { id: 4, firstName: "Greg", lastName: "Andrews", bornYear: 1995, state: "CA" },
      { id: 5, firstName: "Louise", lastName: "Andrews", bornYear: 2012, state: "NY" },
      { id: 6, firstName: "Paul", "lastName": "Smith", bornYear: 2020, state: "CA" }
    ] 

    var _w = r => document.write(r)
    var showName = r => r.firstName + " " + r.lastName
    var _wArr = r => _w(r.map(showName).join(", ")) 
  </script>

  <p><b>Smiths in CA: </b><script>_wArr( $from( family )
                                        .equals("lastName", "Smith")
                                        .equals("state", "CA")
                                        .select())</script></p>

  <p><b>Youngest: </b><script>_w(showName( $from( family )
                                           .attach("age", r => new Date().getFullYear() - r.bornYear)
                                           .min("age")))</script></p>

 </body>
</html>
````

---

## Currently not implemented comparing jLinq

This is not an exaustive list by just to provide a heads-up on what is still missing:

### Functionality

* Parameter arrays to apply functions over values.
* Parameter on or, and, not, andNot & orNot.
* Context key aware "where" methods. 
