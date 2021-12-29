# Clipto backend

Does Twitter verification, accepts files & uploads to arweave.

Still need to implement requests/etc.


## Setup
 1. Create `.env` following `.env.example`.
     - [How to install postgresql on macos](https://www.postgresqltutorial.com/install-postgresql-macos/)
     - [Connection string format](https://www.codegrepper.com/code-examples/sql/get+connection+string+postgresql+in+pgadmin)
 2. Create `wallet.json`
     - [Create an arweave wallet and name it wallet.json at root](https://www.arweave.org/)
 2. `npx prisma generate`
 3. `npm start`

 The project runs on localhost:8000


 ## useful commands
 3. `npx prisma studio`