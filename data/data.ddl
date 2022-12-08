USE tempdb

DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS shipment;
DROP TABLE IF EXISTS productinventory;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS orderproduct;
DROP TABLE IF EXISTS incart;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS ordersummary;
DROP TABLE IF EXISTS paymentmethod;
DROP TABLE IF EXISTS customer;

CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(30),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    isAdmin             BIT DEFAULT 0
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(30),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productImageURL     VARCHAR(100),
    productImage        VARBINARY(MAX),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    customerId          INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),
    PRIMARY KEY (customerId, productId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
    shipmentDate        DATETIME,
    shipmentDesc        VARCHAR(100),
    warehouseId         INT,
    PRIMARY KEY (shipmentId),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory (
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),
    PRIMARY KEY (productId, warehouseId),
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO category(categoryName) VALUES ('Super Ducks');
INSERT INTO category(categoryName) VALUES ('National Ducks');
INSERT INTO category(categoryName) VALUES ('Famous Ducks');
INSERT INTO category(categoryName) VALUES ('Fictional Ducks');
INSERT INTO category(categoryName) VALUES ('Random Ducks');

INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Emo Orphan Duck', 1, 'His parents are dead.',18.00, '/images/Ducks/batDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Murderer Duck', 5, 'You just know he did it.',19.00, '/images/Ducks/butlerDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('College Dropout Duck', 5, 'Drop the beak!',10.00, '/images/Ducks/djDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Hon Hon Duck', 2, 'Oui oui, baguette!',20.00, '/images/Ducks/frenchDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Steroid Duck', 1, 'Duck, smash!',18.00, '/images/Ducks/hulkDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Super Copper Duck', 1, 'Just an asshole with WAY too much money.',22.00, '/images/Ducks/ironDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Holy Duck', 3, 'Kinda looks like Jesus, right?',1.00, '/images/Ducks/jesusDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Meth Duck', 4, 'He just needs a taste, alright?',25.00, '/images/Ducks/methDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Doubloon Duck', 5, 'Not associated with that dumb TikTok trend.',2.00, '/images/Ducks/pirateDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('The Artist Formerly Known as Duck', 3, 'Purple rain and little red corvettes, baby!',42.00, '/images/Ducks/princeDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Legalize It Duck', 3, 'He just wants your ganja!',18.00, '/images/Ducks/reggaeDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Spooky Tongue Duck', 3, 'You do NOT want him to open his mouth. Trust me.',19.00, '/images/Ducks/rockDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Dumb Duck', 4, 'No brains. Only hay.',18.00, '/images/Ducks/scarecrowDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Sticky Duck', 1, 'He got bit by a bug and it kinda worked out for him.',8.00, '/images/Ducks/spiderDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Spuck', 4, 'Live long and consume bread.',18.00, '/images/Ducks/spockDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Denim Duck', 3, 'I do not even really know what this one is meant to be...',18.00, '/images/Ducks/stonerDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Cool Robot Duck', 1, 'I will be quack.',27.00, '/images/Ducks/terminatorDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Not-So-Cool Robot Duck', 4, 'Really? Tin? What a crappy metal.',17.00, '/images/Ducks/tinDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('The Donald Duck', 3, 'Duck save America',40.00, '/images/Ducks/trumpDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Uncle Duck', 2, 'America! Duck yeah!',200.00, '/images/Ducks/usaDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Sad Mask Duck', 4, 'He is your daddy.',24.00, '/images/Ducks/vaderDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Ugly Duck', 5, 'Not THAT ugly duck. I think that was a duckling.',66.00, '/images/Ducks/witchDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Magic Trauma Duck', 1, 'The duck that lived. Somehow.',22.00, '/images/Ducks/wizardDuck.jpeg');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Wooden Duck', 1, 'I am Duck.',12.00, '/images/Ducks/woodDuck.png');
INSERT INTO product(productName, categoryId, productDesc, productPrice, productImageURL) VALUES ('Moaning Space Bear Duck', 4, 'DWAAAAAGGHHHHHH!',19.00, '/images/Ducks/wookieDuck.png');

INSERT INTO warehouse(warehouseName) VALUES ('Main warehouse');
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (1, 1, 5, 18);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (2, 1, 10, 19);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (3, 1, 3, 10);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (4, 1, 2, 22);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (5, 1, 6, 21.35);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (6, 1, 3, 25);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (7, 1, 1, 30);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (8, 1, 0, 40);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (9, 1, 2, 97);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (10, 1, 3, 31);

INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'Manitoba', 'R3X 0C9', 'Canada', 'arnold' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Calgary', 'Alberta', 'T1C 0A1', 'Canada', 'bobby' , 'bobby');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Toronto', 'Ontario', 'M5S 2C5', 'Canada', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Montreal', 'Quebec', 'T8E 1C3', 'Canada', 'beth' , 'test');
INSERT INTO customer (userid, password, isAdmin) VALUES ('admin1', 'secure123', 1)

-- Order 1 can be shipped as have enough inventory
DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (1, '2019-10-15 10:25:55', 91.70)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 1, 1, 18)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 2, 21.35)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 10, 1, 31);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-16 18:00:00', 106.75)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 5, 21.35);

-- Order 3 cannot be shipped as do not have enough inventory for item 7
DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (3, '2019-10-15 3:30:22', 140)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 6, 2, 25)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 7, 3, 30);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-17 05:45:11', 327.85)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 3, 4, 10)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 8, 3, 40)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 13, 3, 23.25)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 20, 2, 21.05)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 19, 4, 14);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (5, '2019-10-15 10:25:55', 277.40)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 4, 21.35)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 19, 2, 81)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 20, 3, 10);

INSERT INTO incart (customerId, productId, quantity, price) VALUES (1, 1, 1, 18.00);
INSERT INTO incart (customerId, productId, quantity, price) VALUES (1, 2, 2, 19.00);
