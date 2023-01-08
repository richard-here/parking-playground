# Setup Instructions
Untuk menjalankan API secara lokal, service berikut harus berjalan di local machine.
- PostgreSQL

Setelah itu, buatlah sebuah `.env` file sesuai dengan key yang ada pada `.example.env` file. Pastikan bahwa untuk key-key pada bagian `#db config` disesuaikan dengan kredensial PostgreSQL yang ada pada mesin lokal.

Selain itu, perlu juga adanya database dengan nama yang sama dengan value pada key `PGDATABASE`. Sebagai contoh, apabila database dibuat dengan user root PostgreSQL dengan perintah
```
CREATE DATABASE parking;
```
maka value `PGDATABASE` juga harus memiliki nilai `parking`.

Value pada `PGUSER` dan juga `PGPASSWORD` juga harus merupakan user PostgreSQL yang memiliki akses penuh ke database yang telah dibuatkan.

Akses dapat diberikan dengan menjalankan command berikut menggunakan root user pada database yang telah dibuat.
```
GRANT ALL PRIVILEGES ON DATABASE db_name TO username;
GRANT USAGE, CREATE ON SCHEMA public to username;
```

Kemudian, jalankan perintah-perintah berikut.
```
npm install
npm run migrate up
npm run start-dev
```

Dan server akan berjalan di mesin lokal pada http://localhost:5000/parking.

 # API Testing dan Cara Penggunaan
Cara penggunaan juga dapat dilihat melalui URL dari collection Postman. Selain itu, payload dalam `body` dapat dilihat pada tab `Pre-request Script`.

Testing API melalui Postman dan collection dapat diakses melalui tautan berikut: https://www.postman.com/richard-here/workspace/parking-api/collection/12531688-ab6b3296-ffe7-422d-8418-e1cc6ef18df9?action=share&creator=12531688.

Collection tersebut dapat didownload ke workspace sendiri terlebih dahulu sebelum dijalankan menggunakan klik kanan pada collection > `Run collection`.

# Unit Testing
Unit testing pada projek ini dilakukan terhadap file-file dalam folder `api`, `service`, dan `validator`. Semua file testing dapat di dalam folder `tests`.

Untuk menjalankan unit test, jalankan command berikut.
```
npm run test
```
