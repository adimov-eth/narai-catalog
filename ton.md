```txt
Copies of the files you have access to may be pasted below 
```

```txt
# Hello World

This is probably the simplest possible Tact program. It will provide callers with the classic output "hello world".

Tact lets you write smart contracts. This code defines a single contract named HelloWorld. Smart contracts must be deployed to the blockchain network to be usable, try to deploy this contract by pressing the Deploy button.

Contract deployments usually cost gas. This website deploys to an emulator of TON blockchain, so gas is emulated TON coin (which is free).

If you're unfamilar with terms like contract, deployment and gas, please read this post first. It's a great introduction to all blockchain terminology you will need to learn Tact.

A simple interaction
Contracts can have getters like greeting(). Getters are special external interface functions that allow users to query information from the contract. Try to call the getter by pressing the Get greeting button. Calling getters is free and does not cost gas.

Don't worry if some things aren't clear now, we will dive into getters in more detail later.

```tact
contract HelloWorld {

    get fun greeting(): String {
        return "hello world";
    }

}
```

# A Simple Counter

This is a simple counter contract that allows users to increment its value.

This contract has a state variable val that persists between contract calls - the counter value. When persisted, this variable is encoded as uint32 - a 32-bit unsigned integer. Contracts pay rent in proportion to the amount of persistent space they consume, so compact representations are encouraged.

State variables should be initialized in init() that runs on deployment of the contract.

Receiving messages
This contract can receive messages from users.

Unlike getters that are just read-only, messages can do write operations and change the contract's persistent state. Incoming messages are processed in receive() methods as transactions and cost gas for the sender.

After deploying the contract, send the increment message by pressing the Send increment button in order to increase the counter value by one. Afterwards, call the getter value() to see that the value indeed changed.

Info: We will learn more in details about "getter" functions in the next example.

```tact
contract Counter {

    // persistent state variable of type Int to hold the counter value
    val: Int as uint32;

    // initialize the state variable when contract is deployed
    init() {
        self.val = 0;
    }

    // handler for incoming increment messages that change the state
    receive("increment") {
        self.val = self.val + 1;
    }

    // read-only getter for querying the counter value
    get fun value(): Int {
        return self.val;
    }
}
```

# The Deployable Trait

Tact doesn't support classical class inheritance, but contracts can implement traits.

One commonly used trait is Deployable, which implements a simple receiver for the Deploy message. This helps deploy contracts in a standardized manner.

All contracts are deployed by sending them a message. While any message can be used for this purpose, best practice is to use the special Deploy message.

This message has a single field, queryId, provided by the deployer (usually set to zero). If the deployment succeeds, the contract will reply with a DeployOk message and echo the same queryId in the response.

If you're using Tact's auto-generated TypeScript classes to deploy, sending the deploy message should look like:

`const msg = { $$type: "Deploy", queryId: 0n };`
`await contract.send(sender, { value: toNano(1) }, msg);`
You can see the implementation of the trait here. Notice that the file deploy.tact needs to be imported from the standard library using the import keyword.

```tact
// this trait has to be imported
import "@stdlib/deploy";

// the Deployable trait adds a default receiver for the "Deploy" message
contract Counter with Deployable {

    val: Int as uint32;

    init() {
        self.val = 0;
    }

    receive("increment") {
        self.val = self.val + 1;
    }

    get fun value(): Int {
        return self.val;
    }
}
```

# Integers

Tact supports a number of primitive data types that are tailored for smart contract use.

Int is the primary number type. Math in smart contracts is always done with integers and never with floating points since floats are unpredictable.

The runtime type Int is always 257-bit signed, so all runtime calculations are done at 257-bit. This should be large enough for pretty much anything you need as it's large enough to hold the number of atoms in the universe.

Persistent state variables can be initialized inline or inside init(). If you forget to initialize a state variable, the code will not compile.

State costs
When encoding Int to persistent state, we will usually use smaller representations than 257-bit to reduce storage cost. The persistent state size is specified in every declaration of a state variable after the as keyword.

Storing 1000 257-bit integers in state costs about 0.184 TON per year.
Storing 1000 32-bit integers only costs 0.023 TON per year by comparison.

```
import "@stdlib/deploy";

contract Integers with Deployable {

    // contract persistent state variables
    // integers can be persisted in state in various sizes
    i1: Int as int257 = 3001;   // range -2^256 to 2^256 - 1 (takes 257 bit = 32 bytes + 1 bit)
    i2: Int as uint256;         // range 0 to 2^256 - 1 (takes 256 bit = 32 bytes)
    i3: Int as int256 = 17;     // range -2^255 to 2^255 - 1 (takes 256 bit = 32 bytes)
    i4: Int as uint128;         // range 0 to 2^128 - 1 (takes 128 bit = 16 bytes)
    i5: Int as int128;          // range -2^127 to 2^127 - 1 (takes 128 bit = 16 bytes)
    i6: Int as coins;           // range 0 to 2^120 - 1 (takes 120 bit = 15 bytes)
    i7: Int as uint64 = 0x1c4a; // range 0 to 18,446,744,073,709,551,615 (takes 64 bit = 8 bytes)
    i8: Int as int64 = -203;    // range -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 (takes 64 bit = 8 bytes)
    i9: Int as uint32 = 0;      // range 0 to 4,294,967,295 (takes 32 bit = 4 bytes)
    i10: Int as int32 = 0;      // range -2,147,483,648 to 2,147,483,647 (takes 32 bit = 4 bytes)
    i11: Int as uint16 = 0;     // range 0 to 65,535 (takes 16 bit = 2 bytes)
    i12: Int as int16 = 0;      // range -32,768 to 32,767 (takes 16 bit = 2 bytes)
    i13: Int as uint8 = 0;      // range 0 to 255 (takes 8 bit = 1 byte)
    i14: Int as int8 = 0;       // range -128 to 127 (takes 8 bit = 1 byte)

    init() {
        self.i2 = 0x83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8; // we can define numbers in hex (base 16)
        self.i4 = 1507998500293440234999; // we can define numbers in decimal (base 10)
        self.i5 = pow(10, 9);   // this is 10^9 = 1,000,000,000
        self.i6 = ton("1.23");  // easy to read coin balances (coins type is nano-tons, like cents, just with 9 decimals)
    }

    receive("show all") {
        dump(self.i1);
        dump(self.i2);
        dump(self.i3);
        dump(self.i4);
        dump(self.i5);
        dump(self.i6);
        dump(self.i7);
        dump(self.i8);
    }

    get fun result(): Int {
        return self.i1;
    }
}
```

# Integer Operations

Since all runtime calculations with integers are done at 257-bit, overflows are quite rare. An overflow can happen if the result of a math operation is too big to fit.

For example, multiplying 2^256 by 2^256 will not fit within 257-bit.

Nevertheless, if any math operation overflows, an exception will be thrown, and the transaction will fail. You could say that Tact's math is safe by default.

There is no problem with mixing variables of different state sizes in the same calculation. At runtime, they are all the same type—always 257-bit signed. This is the largest supported integer type, so they all fit.

Decimal Point with Integers
            Arithmetic with dollars, for example, requires two decimal places. How can we represent the number 1.25 if we are only able to work with integers? The solution is to work with cents. In this way, 1.25 become CD s 125. We simply remember that the 
 two rightmost digits represent the numbers after the decimal point.

Similarly, working with TON coins requires nine decimal places instead of two. Therefore, the amount of 1.25 TON, which can be represented in Tact as ton("1.25"), is actually the number 1250000000.

We refer to these as nano-tons rather than cents.

```tact
import "@stdlib/deploy";

contract Integers with Deployable {

    // contract persistent state variables
    i1: Int as uint128 = 3001;
    i2: Int as int32 = 57;

    init() {}

    receive("show ops") {
        let i: Int = -12; // temporary variable, runtime Int type is always int257 (range -2^256 to 2^256 - 1)
        dump(i);

        i = self.i1 * 3 + (self.i2 - i);    // basic math expressions
        dump(i);

        i = self.i1 % 10;                   // modulo (remainder after division), 3001 % 10 = 1
        dump(i);

        i = self.i1 / 1000;                 // integer division (truncation toward zero), 3001 / 1000 = 3
        dump(i);

        i = self.i1 >> 3;                   // shift right (divide by 2^n)
        dump(i);

        i = self.i1 << 2;                   // shift left (multiply by 2^n)
        dump(i);

        i = min(self.i2, 11);               // minimum between two numbers
        dump(i);

        i = max(self.i2, 66);               // maximum between two numbers
        dump(i);

        i = abs(-1 * self.i2);              // absolute value
        dump(i);

        dump(self.i1 == 3001);
        dump(self.i1 > 2000);
        dump(self.i1 >= 3002);
        dump(self.i1 != 70);
    }
}
```

# Bools

This primitive data type can hold the values true or false.

Bool is convenient for boolean and logical operations. It is also useful for storing flags.

The only supported operations with booleans are && || ! - if you try to add them, for example, the code will not compile.

State costs
Persisting bools to state is very space-efficient, they only take 1-bit. Storing 1000 bools in state costs about 0.00072 TON per year.

```tact
import "@stdlib/deploy";

contract Bools with Deployable {

    // contract persistent state variables
    b1: Bool = true;
    b2: Bool = false;
    b3: Bool;

    init() {
        self.b3 = !self.b2;
    }

    receive("show all") {
        dump(self.b1);
        dump(self.b2);
        dump(self.b3);
    }

    receive("show ops") {
        let b: Bool = true; // temporary variable
        dump(b);

        b = self.b1 && self.b2 || !self.b3;
        dump(b);

        dump(self.b1 == true);
        dump(self.b1 == self.b2);
        dump(self.b1 != self.b2);
    }

    get fun result(): Bool {
        return self.b1;
    }
}
```

# Addresses

Address is another primitive data type. It represents standard addresses on the TON blockchain. Every smart contract on TON is identifiable by its address. Think of this as a unique id.

TON is divided into multiple chains called workchains. This allows to balance the load more effectively. One of the internal fields of the address is the workchain id:

0 - The standard workchain, for regular users. Your contracts will be here.

-1 - The masterchain, usually for validators. Gas on this chain is significantly more expensive, but you'll probably never use it.

There are multiple ways on TON to represent the same address. Notice in the contract that the bouncable and non-bouncable representations of the same address actually generate the exact same value. Inside the contract, it doesn't matter which representation you use.

State costs
Most addresses take 264-bit to store (8-bit for the workchain id and 256-bit for the account id). This means that storing 1000 addresses costs about 0.189 TON per year.

```tact
import "@stdlib/deploy";

contract Addresses with Deployable {

    // contract persistent state variables
    // we have three representations of the same address
    a1: Address = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"); // bouncable (same foundation wallet)
    a2: Address = address("UQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqEBI"); // non-bounceable (same foundation wallet)
    a3: Address;

    a4: Address;
    a5: Address;
    a6: Address;

    init() {
        // this is the third representation of the same address
        self.a3 = newAddress(0, 0x83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8); // raw (same foundation wallet)

        // here are a few other important addresses
        self.a4 = newAddress(0, 0); // the zero address (nobody)
        self.a5 = myAddress();      // address of this contract
        self.a6 = sender();         // address of the deployer (the sender during init())
    }

    receive("show all") {
        /// addresses cannot currently be dumped
        /// TODO: https://github.com/tact-lang/tact/issues/16
        /// dump(self.a1);
    }

    receive("show ops") {
        // temporary variable
        let a: Address = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"); // bouncable (same foundation wallet)

        dump(a == self.a1);
        dump(a == self.a2);
        dump(a == self.a3);

        dump(a == self.a4);
        dump(a != self.a5);
    }

    get fun result(): Address {
        return self.a1;
    }
}
```

# Strings

Tact has basic support for strings. Strings support unicode and don't have any special escape characters like \n.

The use of strings in smart contracts should be quite limited. Smart contracts are very exact programs for managing money, they're not intended for interactive CLI.

Strings are immutable. Once a sequence of characters is created, this sequence cannot be modified.

If you need to concatenate strings in run-time, you can use a StringBuilder. This object handles gas efficiently and supports append() of various types to the string.

```tact
import "@stdlib/deploy";

contract Strings with Deployable {

    // contract persistent state variables
    s1: String = "hello world";
    s2: String = "yes unicode 😀 😅 你好 no escaping"; /// TODO: https://github.com/tact-lang/tact/issues/25 \n \t";
    s3: String;
    s4: String;
    s5: String;
    s6: String;

    init() {
        let i1: Int = -12345;
        let i2: Int = 6780000000; // coins = ton("6.78")

        self.s3 = i1.toString();
        self.s4 = i1.toFloatString(3);
        self.s5 = i2.toCoinsString();

        // gas efficient helper to concatenate strings in run-time
        let sb: StringBuilder = beginString();
        sb.append(self.s1);
        sb.append(", your balance is: ");
        sb.append(self.s5);
        self.s6 = sb.toString();
    }

    receive("show all") {
        dump(self.s1);
        dump(self.s2);
        dump(self.s3);
        dump(self.s4);
        dump(self.s5);
        dump(self.s6);
    }

    receive("show ops") {
        let s: String = "how are you?"; // temporary variable
        dump(s);

        /// TODO: https://github.com/tact-lang/tact/issues/24
        /// dump(self.s1 == "hello world");
        /// dump(self.s1 != s);
    }

    get fun result(): String {
        return self.s1;
    }
}
```

# Variables

The most important variables are those that are persisted in state and retain their value between contract executions. They must be defined in the scope of the contract like contractVar1.

Persisting data in state costs gas. The contract must pay rent periodically from its balance. State storage is expensive, about 4 TON per MB per year. If the contract runs out of balance, the data will be deleted. If you need to store large amounts of data, like images, a service like TON Storage would be more suitable.

Persistent state variables can only change in receivers by sending messages as transactions. Sending these transactions will cost gas to users.

Executing getters is read-only, they can access all variables, but cannot change state variables. They are free to execute and don't cost any gas.

Local variables like localVar1 are temporary. They're not persisted to state. You can define them in any function and they will only exist in run-time during the execution of the function. You can change their value in getters too.

```tact
import "@stdlib/deploy";

contract Variables with Deployable {

    // contract variables are persisted in state and can change their value between transactions
    // they cost rent per their specified size
    contractVar1: Int as coins = ton("1.26");
    contractVar2: Int as uint64;

    init(arg1: Int) {
        // contract variables support complex initializations that are calculated in run-time
        self.contractVar2 = min(arg1, pow(2, 64) - 1);
    }

    // receivers handle incoming messages and can change state
    receive("increment") {
        // local variables are temporary, not persisted in state
        let localVar1: Int = 100 * 1000;
        localVar1 = localVar1 * 2;

        // contract variables that are persisted in state can only change in receivers
        self.contractVar1 = self.contractVar1 + 1;
        self.contractVar2 = self.contractVar2 + 1;
    }

    // getters are executed by users to query data and can't change state
    get fun sum(arg1: Int): Int {
        // local variables are temporary, not persisted in state
        let localVar1: Int = 100 * 1000;
        localVar1 = localVar1 * 2;

        // getters can access everything but for read-only operations only
        return arg1 + self.contractVar1 + localVar1;
    }
}
```

# Constants

Unlike variables, constants cannot change. Their values are calculated in compile-time and cannot change during execution.

Constant initializations must be relatively simple and only rely on values known during compilation. If you add two numbers for example, the compiler will calculate the result during build and put the result in your compiled code.

You can read constants both in receivers and in getters.

Unlike contract variables, constants don't consume space in persistent state. Their values are stored directly in the code cell.

There isn't much difference between constants defined outside of a contract and inside the contract. Those defined outside can be used by other contracts in your project.

```tact
import "@stdlib/deploy";

// global constants are calculated in compile-time and can't change
const GlobalConst1: Int = 1000 + ton("1.24") + pow(10, 9);

contract Constants with Deployable {

    // contract constants are calculated in compile-time and can't change
    const ContractConst1: Int = 2000 + ton("1.25") + pow(10, 9);

    // if your contract can be in multiple states, constants are an easy alternative to enums
    const StateUnpaid: Int = 0;
    const StatePaid: Int = 1;
    const StateDelivered: Int = 2;
    const StateDisputed: Int = 3;

    init() {}

    get fun sum(): Int {
        // you can read the constants anywhere
        return GlobalConst1 + self.ContractConst1 + self.StatePaid;
    }
}
```

# Getters

Getters are special contract functions that allow users to query information from the contract.

Contract methods starting with the prefix get fun are all getters. You can define as many getters are you want. Each getter must also specify its return type - counter() for example returns an Int.

Calling getters is free and does not cost gas. The call is executed by a full node and doesn't go through consensus with all the validators nor is added to a new block.

Getters are read-only, they cannot change the contract persistent state.

If we were to omit the get keyword from the function declaration of a getter, it will stop being a getter. External users would no longer be able call this function and it would essentially become a private method of the contract.

Getters between contracts
A contract cannot execute a getter of another contract.

Getters are only executable by end-users off-chain. Since contracts are running on-chain, they do not have access to each other's getters.

So, if you can't call a getter, how can two contracts communicate?

The only way for contracts to communicate on-chain is by sending messages to each other. Messages are handled in receivers.

Info: TON Blockchain is an asynchronous blockchain, which means that smart contracts can interact with each other only by sending messages.

```tact
import "@stdlib/deploy";

contract Getters with Deployable {

    count: Int as uint32;

    init() {
        self.count = 17;
    }

    get fun counter(): Int {
        return self.count;
    }

    get fun location(): Address {
        return myAddress();
    }

    get fun greeting(): String {
        return "hello world";
    }

    get fun sum(a: Int, b: Int): Int {
        return a + b;
    }

    get fun and(a: Bool, b: Bool): Bool {
        return a && b;
    }

    get fun answer(a: Int): String {
        let sb: StringBuilder = beginString();
        sb.append("The meaning of life is ");
        sb.append(a.toString());
        return sb.toString();
    }
}
```

# Receivers and Messages

In TON, users interact with contracts by sending them messages. Different contracts can only communicate with each other by sending each other messages.

Since users actually use wallet contracts, messages from users are actually messages coming from just another contract.

Sending a message to a contract costs gas and is processed in the course of a transaction. The transaction executes when validators add the transaction to a new block. This can take a few seconds. Messages are also able to change the contract's persistent state.

Receivers
When designing your contract, make a list of every operation that your contract supports, then, define a message for each operation, and finally, implement a handler for each message containing the logic of what to do when it arrives.

Contract methods named receive() are the handlers that process each incoming message type. Tact will automatically route every incoming message to the correct receiver listening for it according to its type. A message is only handled by one receiver.

Messages are defined using the message keyword. They can carry input arguments. Notice that for integers, you must define the encoding size, just like in state variables. When somebody sends the message, they serialize it over the wire.

```tact
import "@stdlib/deploy";

// this message will cause our contract to add an amount to the counter
message Add {
    amount: Int as uint32;
}

// this message will cause our contract to subtract an amount from the counter
message Subtract {
    amount: Int as uint32;
}

// this message will cause our contract to do a complex math operation on the counter
message MultiMath {
    add: Int as uint32;
    subtract: Int as uint32;
    multiply: Int as uint32;
}

contract Receivers with Deployable {

    val: Int as int64;

    init() {
        self.val = 0;
    }

    // handler for the "Add" message - this is a binary message that has an input argument (amount)
    receive(msg: Add) {
        self.val = self.val + msg.amount;
    }

    // handler for the "Subtract" message - this is a different binary message although its format is identical
    receive(msg: Subtract) {
        self.val = self.val - msg.amount;
    }

    // handler for the "MultiMath" message - this is a binary message that holds multiple input arguments
    receive(msg: MultiMath) {
        self.val = self.val + msg.add;
        self.val = self.val - msg.subtract;
        self.val = self.val * msg.multiply;
    }

    // handler for "increment" textual message - this is a textual string message, these cannot carry input arguments
    receive("increment") {
        self.val = self.val + 1;
    }

    // handler for "decrement" textual message - this is a different textual string message, you can have as many as you want
    receive("decrement") {
        self.val = self.val - 1;
    }

    get fun value(): Int {
        return self.val;
    }
}
```

# Textual Messages

Most of the messages we saw in the previous example were defined with the message keyword. They are considered binary messages. This means that when somebody wants to send them, they serialize them into bits and bytes of binary data.

The disadvantage with binary messages is that they're not human readable.

Hardware wallets and blind signing
When working with dangerous contracts that handle a lot of money, users are encouraged to use hardware wallets like Ledger. Hardware wallets cannot decode binary messages to confirm to the user what they're actually signing.

Tact supports textual messages for this reason, since they're human readable and can easily be confirmed with users, eliminating phishing risks.

Textual messages are limited because they cannot contain arguments. Future versions of Tact will add this functionality.

Using the comment field
If you've ever made a transfer using a TON wallet, you probably noticed that you can add a comment (also known as a memo or a tag). This is how textual messages are sent.

Receivers for textual messages just define the string that they expect. Tact automatically does string matching and calls the matching receiver when a comment message arrives.

```tact
import "@stdlib/deploy";

contract Receivers with Deployable {

    val: Int as int64;

    init() {
        self.val = 0;
    }

    // this receiver is called when the string "increment" is received in an incoming string comment message
    receive("increment") {
        self.val = self.val + 1;
    }

    // this receiver is called when the string "decrement" is received in an incoming string comment message
    receive("decrement") {
        self.val = self.val - 1;
    }

    // this receiver is called when the string "increment by 2" is received in an incoming string comment message


    receive("increment by 2") {
        self.val = self.val + 2;
    }

    // if none of the previous receivers match the comment string, this one is called
    receive(msg: String) {
        dump("unknown textual message received:");
        dump(msg);
    }

    get fun value(): Int {
        return self.val;
    }
}
```

# Structs

Structs allow you to combine multiple primitives together in a more semantic way. They're a great tool to make your code more readable.

Structs can define complex data types that contain multiple fields of different types. They can also be nested.

Structs can also include both default fields and optional fields. This can be quite useful when you have many fields but don't want to keep respecifying them.

Structs are also useful as return values from getters or other internal functions. They effectively allow a single getter to return multiple return values.

The order of fields does not matter. Unlike other languages, Tact does not have any padding between fields.

Info: You can check more "Optionals" examples here: Optionals
Structs vs. messages
Structs and messages are almost identical with the only difference that messages have a 32-bit header containing their unique numeric id. This allows messages to be used with receivers since the contract can tell different types of messages apart based on this id.

```tact
import "@stdlib/deploy";

struct Point {
    x: Int as int64;
    y: Int as int64;
}

struct Params {
    name: String = "Satoshi";   // default value
    age: Int? = null;           // optional field
    point: Point;               // nested structs
}

message Add {
    point: Point;               // message can hold a struct
}

contract Structs with Deployable {

    // contract persistent state variables
    s1: Point;
    s2: Params;

    init() {
        self.s1 = Point{x: 2, y: 3};
        self.s2 = Params{point: self.s1};
    }

    receive("show ops") {
        // temporary variable
        let s: Point = Point{x: 4, y: 5};

        self.s1 = s;
    }

    receive(msg: Add) {
        self.s1.x = self.s1.x + msg.point.x;
        self.s1.y = self.s1.y + msg.point.y;
    }

    get fun point(): Point {
        return self.s1;
    }

    get fun params(): Params {
        return self.s2;
    }
}
```

# Message Sender

Every incoming message is sent from some contract that has an address.

You can query the address of the message sender by calling sender(). Alternatively, the address is also available through context().sender.

The sender during execution of the init() method of the contract is the address who deployed the contract.

Authenticating messages
The main way to authenticate an incoming message, particularly for priviliges actions, is to verify the sender. This field is secure and impossible to fake.

Info: More detail about context can find in here: context()

```tact
import "@stdlib/deploy";

contract MessageSender with Deployable {

    deployer: Address;
    lastSender: Address;

    init() {
        self.deployer = sender(); // sender() of init is who deployed the contract
        self.lastSender = newAddress(0, 0); // zero address
    }

    receive("who") {
        if (sender() == self.deployer) {
            dump("deployer");
        } else {
            dump("not deployer!");
        }
    }

    receive("hello") {
        if (sender() != self.lastSender) {
            self.lastSender = sender();
            dump("hello new sender!");
        }
    }
}
```

# Throwing Errors

Processing an incoming message in a transaction isn't always successful. The contract may encounter some error and fail.

This can be due to an explicit decision of the contract author, usually by writing a require() on a condition that isn't met, or this may happen implicitly due to some computation error in run-time, like a math overflow.

When an error is thrown, the transaction reverts. This means that all persistent state changes that took place during this transaction, even those that happened before the error was thrown, are all reverted and return to their original values.

Notifying the sender about the error
How would the sender of the incoming message know that the message they had sent was rejected due to an error?

All communication is via messages, so naturally the sender should receive a message about the error. TON will actually return the original message back to the sender and mark it as bounced - just like a snail mail letter that couldn't be delivered.

```tact
import "@stdlib/deploy";

message Divide {
    by: Int as uint32;
}

contract Errors with Deployable {

    val: Int as int64;

    init() {
        self.val = 0;
    }

    // not meeting the condition will raise an error, revert the transaction and all state changes
    receive("increment") {
        self.val = self.val + 1;
        require(self.val < 5, "Counter is too high");
    }

    // any exceptions during execution will also revert the transaction and all state changes
    receive(msg: Divide) {
        self.val = 4;
        self.val = self.val / msg.by;
    }

    // advanced: revert the transaction and return a specific non-zero exit code manually
    // https://ton.org/docs/learn/tvm-instructions/tvm-exit-codes
    receive("no access") {
        throw(132);
    }

    get fun value(): Int {
        return self.val;
    }
}
```

# Receiving TON Coins

Every contract has a TON coin balance. This balance is used to pay ongoing rent for storage and should not run out otherwise the contract may be deleted. You can store extra coins in the balance for any purpose.

Every incoming message normally carries some TON coin value sent by the sender. This value is used to pay gas for handling this message. Unused excess will stay in the contract balance. If the value doesn't cover the gas cost, the transaction will revert.

You can query the contract balance with myBalance() - note that the value is in nano-tons (like cents, just with 9 decimals). The balance already contains the incoming message value.

Info: More detail about myBalance() can be found here: myBalance()
Refunding senders
If the transaction reverts, unused excess value will be sent back to sender on the bounced message.

You can also refund the excess if the transaction succeeds by sending it back using self.reply() in a response message. This is the best way to guarantee senders are only paying for the exact gas that their message consumed.

```tact
import "@stdlib/deploy";

contract ReceiveCoins with Deployable {

    val: Int as int64;

    init() {
        self.val = 0;
    }

    // receive empty messages, these are usually simple TON coin transfers to the contract
    receive() {
        dump("empty message received");
        // revert the transaction if balance is growing over 3 TON
        require(myBalance() <= ton("3"), "Balance getting too high");
    }

    receive("increment") {
        // print how much TON coin were sent with this message
        dump(context().value);
        self.val = self.val + 1;
    }

    receive("refunding increment") {
        // print how much TON coin were sent with this message
        dump(context().value);
        self.val = self.val + 1;
        // return all the unused excess TON coin value on the message back to the sender (with a textual string message)
        self.reply("increment refund".asComment());
    }

    get fun balance(): Int {
        return myBalance(); // in nano-tons (like cents, just with 9 decimals)
    }
}
```

# Messages Between Contracts

Different contracts can communicate with each other only by sending messages. This example showcases two separate contracts working in tandem:

Counter - A simple counter that can increment only by 1.
BulkAdder - This contract instructs Counter to increment multiple times.
Click the Deploy button to deploy both contracts. To make the counter reach 5, send the Reach message to BulkAdder by clicking the Send Reach{5} button.

Observe the number of messages exchanged between the two contracts. Each message is processed as a separate transaction. Also note that BulkAdder cannot call a getter on Counter; it must send a query message instead.

Who's Paying for Gas
By default, the original sender is responsible for covering the gas costs of the entire cascade of messages they initiate. This is funded by the original TON coin value sent with the first Reach message.

Internally, this is managed by each message handler forwarding the remaining excess TON coin value to the next message it sends.

Challenge: Try to modify the code to refund the original sender any unused excess gas.

```tact
import "@stdlib/deploy";

message CounterValue {
    value: Int as uint32;
}

////////////////////////////////////////////////////////////////////////////
// this is our famous Counter contract, we've seen it before
// this contract is very annoying, it only allows to increment +1 at a time!

contract Counter with Deployable {

    val: Int as uint32;

    init() {
        self.val = 0;
    }

    // step 6: this contract allows anyone to ask it to increment by 1 (ie. the other contract)
    receive("increment") {
        self.val = self.val + 1;
        self.reply(CounterValue{value: self.val}.toCell());
    }

    // step 3: this contract replies with its current value to anyone asking (ie. the other contract)
    receive("query") {
        self.reply(CounterValue{value: self.val

}.toCell());
    }

    get fun value(): Int {
        return self.val;
    }
}

message Reach {
    counter: Address;
    target: Int as uint32;
}

////////////////////////////////////////////////////////////////////////////
// let's write a second helper contract to make our lives a little easier
// it will keep incrementing the previous contract as many times as we need!

contract BulkAdder with Deployable {

    target: Int as uint32;

    init() {
        self.target = 0;
    }

    // step 1: users will send this message to tell us what target value we need to reach
    receive(msg: Reach) {
        self.target = msg.target;
        // step 2: this contract will query the current counter value from the other contract
        send(SendParameters{
            to: msg.counter,
            value: 0, /// TODO: https://github.com/tact-lang/tact/issues/31
            mode: SendRemainingValue + SendIgnoreErrors, /// TODO: issues/31
            body: "query".asComment()
        });
    }

    // step 4: the other contract will tell us what is its current value by sending us this message
    receive(msg: CounterValue) {
        if (msg.value < self.target) {
            // step 5: if its value is too low, send it another message to increment it by +1 more
            send(SendParameters{
                to: sender(),
                value: 0, /// TODO: same issue 31
                mode: SendRemainingValue + SendIgnoreErrors, /// TODO: https://github.com/tact-lang/tact/issues/31
                body: "increment".asComment()
            });
        }
    }
}
```

# Sending TON Coins

This contract allows to withdraw TON coins from its balance. Notice that only the deployer is permitted to do that, otherwise this money could be stolen.

The withdrawn funds are sent as value on an outgoing message to the sender. It's a good idea to set the bounce flag explicitly to true (although this also the default), so if the outgoing message fails for any reason, the money would return to the contract.

Contracts need to have a non-zero balance so they can pay storage costs occasionally, otherwise they may get deleted. This contract can make sure you always leave 0.01 TON which is enough to store 1 KB of state for 2.5 years.

The intricate math
myBalance() is the contract balance including the value for gas sent on the incoming message. myBalance() - context().value is the balance without the value for gas sent on the incoming message.

Send mode SendRemainingValue will add to the outgoing value any excess left from the incoming message after all gas costs are deducted from it.

Send mode SendRemainingBalance will ignore the outgoing value and send the entire balance of the contract. Note that this will not leave any balance for storage costs so the contract may be deleted.

```tact
import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins;
}

contract SendCoins with Deployable {

    const MinTonForStorage: Int = ton("0.01"); // enough for 1 KB of storage for 2.5 years
    deployer: Address;

    init() {
        self.deployer = sender();
    }

    // accept incoming TON transfers
    receive() {
        dump("funds received");
    }

    // this will withdraw the entire balance of the contract and leave 0
    receive("withdraw all") {
        require(sender() == self.deployer, "Only deployer is allowed to withdraw");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    // this will withdraw the entire balance but leave 0.01 for storage rent costs
    receive("withdraw safe") {
        require(sender() == self.deployer, "Only deployer is allowed to withdraw");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.MinTonForStorage,
            mode: SendRemainingValue + SendIgnoreErrors
        });
    }

    // this will withdraw a specific amount but leave 0.01 for storage rent costs
    receive(msg: Withdraw) {
        require(sender() == self.deployer, "Only deployer is allowed to withdraw");
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MinTonForStorage);
        require(amount > 0, "Insufficient balance");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: amount,
            mode: SendRemainingValue + SendIgnoreErrors
        });
    }

    get fun balance(): String {
        return myBalance().toCoinsString();
    }
}
```

# Emitting Logs

It is sometimes useful to emit events from the contract in order to indicate that certain things happened.

This data can later be analyzed off-chain and indexed by using RPC API to query all transactions sent to the contract.

Consider for example a staking contract that wants to indicate how much time passed before users unstaked for analytics purposes. By analyzing this data, the developer can think of improvements to the product.

One way to achieve this is by sending messages back to the sender using self.reply() or by sending messages to the zero address. These two methods work, but they are not the most efficient in terms of gas.

The emit() function will output a message (binary or textual) from the contract. This message does not actually have a recipient and is very gas-efficient because it doesn't actually need to be delivered.

The messages emitted in this way are still recorded on the blockchain and can be analyzed by anyone at any later time.

```tact
import "@stdlib/deploy";

message TransferEvent {
    amount: Int as coins;
    recipient: Address;
}

message StakeEvent {
    amount: Int as coins;
}

contract Emit with Deployable {

    init() {}

    receive("action") {
        // handle action here
        // ...
        // emit log that the action was handled
        emit("Action handled".asComment());
    }

    receive("transfer") {
        // handle transfer here
        // ...
        // emit log that the transfer happened
        emit(TransferEvent{amount: ton("1.25"), recipient: sender()}.toCell());
    }

    receive("stake") {
        // handle stake here
        // ...
        // emit log that stake happened
        emit(StakeEvent{amount: ton("0.007")}.toCell());
    }
}
```

# If Statements

Tact supports if statements in a similar syntax to most programming languages that you're used to. Curly braces are required though, so you can't leave them out.

The condition of the statement can be any boolean expression.

There is no switch statement in Tact. If you need to need to handle a group of outcomes separately, follow the else if pattern you can see in the third example.

```tact
import "@stdlib/deploy";

contract IfStatements with Deployable {

    val: Int as int32;

    init() {
        self.val = 17;
    }

    receive("check1") {
        if (self.val > 10) {
            dump("larger than 10");
        }
    }

    receive("check2")  {
        if (self.val > 100) {
            dump("larger than 100");
        } else {
            dump("smaller than 100");
        }
    }

    receive("check3") {
        if (self.val > 1000) {
            dump("larger than 1000");
        } else if (self.val > 500) {
            dump("between 500 and 1000");
        } else {
            dump("smaller than 500");
        }
    }
}
```

# Loops

Tact does not support traditional for loops, but its loop statements are equivalent and can easily implement the same things. Also note that Tact does not support break and continue statements in loops like some languages.

The repeat loop statement input number must fit within an int32, otherwise an exception will be thrown.

The condition of the while and until loop statements can be any boolean expression.

Smart contracts consume gas for execution. The amount of gas is proportional to the number of iterations. The last example iterates too many times and reverts due to an out of gas exception.

```tact
import "@stdlib/deploy";

contract Loops with Deployable {

    init() {}

    receive("loop1") {
        let sum: Int = 0;
        let i: Int = 0;
        repeat (10) {               // repeat exactly 10 times
            i = i + 1;
            sum = sum + i;
        }
        dump(sum);
    }

    receive("loop2") {
        let sum: Int = 0;
        let i: Int = 0;
        while (i < 10) {            // loop while a condition is true
            i = i + 1;
            sum = sum + i;
        }
        dump(sum);
    }

    receive("loop3") {
        let sum: Int = 0;
        let i: Int = 0;
        do {                        // loop until a condition is true
            i = i + 1;
            sum = sum + i;
        } until (i >= 10);
        dump(sum);
    }

    receive("out of gas") {
        let i: Int = 0;
        while (i < pow(10, 6)) {    // 1 million iterations is too much
            i = i + 1;
        }
        dump(i);
    }
}
```

# Functions

To make your code more readable and promote code reuse, you're encouraged to divide
 it into functions.

Functions in Tact start with the fun keyword. Functions can receive multiple input arguments and can optionally return a single output value. You can return a struct if you want to return multiple values.

Global static functions are defined outside the scope of contracts. You can call them from anywhere, but they can't access the contract or any of the contract state variables.

Contract methods are functions that are defined inside the scope of a contract. You can call them only from other contract methods like receivers and getters. They can access the contract's state variables.

```tact
import "@stdlib/deploy";

struct TokenInfo {
    ticker: String;
    decimals: Int as uint8;
}

// this is a global static function that can be called from anywhere
fun average(a: Int, b: Int): Int {
    return (a + b) / 2;
}

contract Functions with Deployable {

    deployer: Address;

    init() {
        self.deployer = sender();
    }

    // this contract method can be called from within this contract and access its variables
    fun onlyDeployer() {
        require(sender() == self.deployer, "Only the deployer is permitted here");
    }

    receive("priviliged") {
        self.onlyDeployer();
    }

    // this contract method returns multiple return values using a struct
    fun getInfo(index: Int): TokenInfo {
        if (index == 1) {
            return TokenInfo{ticker: "TON", decimals: 9};
        }
        if (index == 2) {
            return TokenInfo{ticker: "ETH", decimals: 18};
        }
        return TokenInfo{ticker: "unknown", decimals: 0};
    }

    receive("best L1") {
        let best: TokenInfo = self.getInfo(1);
        self.reply(best.ticker.asComment());
    }

    get fun result(): Int {
        return average(1, 10);
    }
}
```

# Optionals

Optionals are variables or struct fields that can be null and don't necessarily hold a value. They are useful to reduce state size when the variable isn't necessarily used.

You can make any variable optional by adding ? after its type.

Optional variables that are not defined hold the null value. You cannot access them without checking for null first.

If you're certain an optional variable is not null, append to the end of its name !! to access its value. Trying to access the value without !! will result in a compilation error.

```tact
import "@stdlib/deploy";

struct StrctOpts {
    sa: Int?;
    sb: Bool?;
    sc: Address?;
}

message MsgOpts {
    ma: Int?;
    mb: Bool?;
    mc: Address?;
    md: StrctOpts?;
}

contract Optionals with Deployable {

    ca: Int?;
    cb: Bool?;
    cc: Address?;
    cd: StrctOpts?;

    init(a: Int?, b: Bool?, c: Address?) {
        self.ca = a;
        self.cb = b;
        self.cc = c;
        self.cd = StrctOpts{sa: null, sb: true, sc: null};
    }

    receive(msg: MsgOpts) {
        let i: Int = 12;
        if (msg.ma != null) {
            i = i + msg.ma!!; // !! tells the compiler this can't be null
            self.ca = i;
        }
    }

    get fun optInt(): Int? {
        return self.ca;
    }

    get fun optIntVal(): Int {
        if (self.ca == null) {
            return -1;
        } else {
            return self.ca!!; // !! tells the compiler this can't be null
        }
    }

    get fun optNested(): Int? {
        if (self.cd != null && (self.cd!!).sa != null) {
            return (self.cd!!).sa!!; // !! tells the compiler this can't be null
        } else {
            return null;
        }
    }
}
```

# Maps

Maps are a dictionary type that can hold an arbitrary number of items, each under a different key.

The keys in maps can either be an Int type or an Address type.

You can check if a key is found in the map by calling the get() method. This will return null if the key is missing or the value if the key is found. Replace the value under a key by calling the set() method.

Integers in maps stored in state currently use the largest integer size (257-bit). Future versions of Tact will let you optimize the encoding size.

Limit the number of items
Maps are designed to hold a limited number of items. Only use a map if you know the upper bound of items that it may hold. It's also a good idea to write a test to add the maximum number of elements to the map and see how gas behaves under stress.

If the number of items is unbounded and can potentially grow to billions, you'll need to architect your contract differently. We will discuss unbounded maps later on under the topic of contract sharding.

```tact
import "@stdlib/deploy";

struct TokenInfo {
    ticker: String;
    decimals: Int;
}

// messages can contain maps
message Replace {
    items: map<Int, Address>;
}

contract Maps with Deployable {

    // maps with Int as key
    mi1: map<Int, TokenInfo>;
    mi2: map<Int, Bool>;
    mi3: map<Int, Int>;
    mi4: map<Int, Address>;

    // maps with Address as key
    ma1: map<Address, TokenInfo>;
    ma2: map<Address, Bool>;
    ma3: map<Address, Int>;
    ma4: map<Address, Address>;

    init(arg: map<Int, Bool>) {
        // no need to initialize maps if they're empty
        self.mi2 = arg;
    }

    receive("set keys") {
        // keys are Int
        self.mi1.set(17, TokenInfo{ticker: "SHIB", decimals: 9});
        self.mi2.set(0x9377433ff21832, true);
        self.mi3.set(pow(2,240), pow(2,230));
        self.mi4.set(-900, address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"));
        // keys are Address
        self.ma1.set(address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"), TokenInfo{ticker: "DOGE", decimals: 18});
        self.ma2.set(address("UQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqEBI"), true);
        self.ma3.set(address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"), ton("1.23"));
        self.ma4.set(address("UQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqEBI"), myAddress());
    }

    receive("delete keys") {
        // keys are Int
        self.mi1.set(17, null);
        self.mi2.set(0x9377433ff21832, null);
        self.mi3.set(pow(2,240), null);
        self.mi4.set(-900, null);
        // keys are Address
        self.ma1.set(address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"), null);
        self.ma2.set(address("UQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqEBI"), null);
        self.ma3.set(address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"), null);
        self.ma4.set(address("UQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqEBI"), null);
    }

    receive("clear") {
        self.mi1 = emptyMap();
        self.mi2 = emptyMap();
        self.mi3 = emptyMap();
        self.mi4 = emptyMap();
        self.ma1 = emptyMap();
        self.ma2 = emptyMap();
        self.ma3 = emptyMap();
        self.ma4 = emptyMap();
    }

    receive(msg: Replace) {
        // replace all items in the map with those coming in the message
        self.mi4 = msg.items;
    }

    // if the key is not found, the get() method returns null
    get fun oneItem(key: Int): Address? {
        return self.mi4.get(key);
    }

    get fun itemCheck(): String {
        if (self.mi1.get(17) == null) {
            return "not found";
        }
        let item: TokenInfo = self.mi1.get(17)!!; // !! tells the compiler this can't be null
        return item.ticker;
    }

    // you can return maps from getters
    get fun allItems(): map<Address, TokenInfo> {
        return self.ma1;
    }
}
```

# Arrays

You can implement simple arrays in Tact by using the map type.

To create an array, define a map with an Int type as the key. This key will represent the index in the array. Additionally, include a variable to keep track of

 the current length of the array.

In the example, we provide multiple functions to manipulate the array. You can add or remove elements from the array. The pop() method will revert if the array is empty.

Reading elements from the array can be done using the get() method, while len() returns the current length of the array.

Finally, note that you can define arrays as struct fields or message fields, as you would expect.

```tact
import "@stdlib/deploy";

message Reset {
    items: map<Int, Address>;
}

contract Arrays with Deployable {

    // array state variables
    arr: map<Int, Int>;
    len: Int as uint32;

    init() {
        self.arr = emptyMap();
        self.len = 0;
    }

    receive("clear") {
        self.arr = emptyMap();
        self.len = 0;
    }

    receive("push 1") {
        self.arr.set(self.len, 1);
        self.len = self.len + 1;
    }

    receive("push 2") {
        self.arr.set(self.len, 2);
        self.len = self.len + 1;
    }

    receive("pop") {
        require(self.len > 0, "array empty");
        self.len = self.len - 1;
        self.arr.set(self.len, null);
    }

    receive("replace") {
        self.arr = emptyMap();
        self.len = 0;
        self.arr.set(0, 3);
        self.arr.set(1, 4);
        self.arr.set(2, 5);
        self.len = 3;
    }

    receive(msg: Reset) {
        self.arr = emptyMap();
        self.len = 0;
        for (let i: Int = 0; i < msg.items.len(); i = i + 1) {
            self.arr.set(i, 7);
        }
        self.len = msg.items.len();
    }

    get fun length(): Int {
        return self.len;
    }

    get fun first(): Int? {
        return self.arr.get(0);
    }

    get fun all(): map<Int, Int> {
        return self.arr;
    }
}
```

# Events

Events can be used for a variety of purposes to indicate when certain actions happen in a smart contract. They can be emitted using the emit() function.

For example, you can use events to indicate when a new user signs up or when a transaction occurs.

Events are defined using the event keyword followed by the event name and the event fields. Events can contain multiple fields of various types.

Emitting an event is similar to emitting a message. You can use the emit() function followed by the event name and the event fields.

Events are recorded on the blockchain and can be analyzed off-chain.

```tact
import "@stdlib/deploy";

event NewUser {
    name: String;
    age: Int;
}

event Transaction {
    from: Address;
    to: Address;
    amount: Int;
}

contract Events with Deployable {

    init() {}

    receive("new user") {
        emit(NewUser{name: "Alice", age: 25});
    }

    receive("transaction") {
        emit(Transaction{from: sender(), to: myAddress(), amount: ton("1.5")});
    }
}
```

# Modifiers

Modifiers are a way to add common checks or operations to multiple functions. They are defined using the modifier keyword followed by the modifier name and the modifier body.

Modifiers can be applied to functions by using the `modifier` keyword followed by the modifier name. The modifier will be executed before the function body.

Modifiers can also accept arguments. This allows for more flexible and reusable code.

```tact
import "@stdlib/deploy";

modifier onlyDeployer() {
    require(sender() == self.deployer, "Only deployer is allowed");
}

modifier minAmount(amount: Int) {
    require(context().value >= amount, "Minimum amount not met");
}

contract Modifiers with Deployable {

    deployer: Address;

    init() {
        self.deployer = sender();
    }

    receive("restricted") onlyDeployer {
        dump("Restricted function called");
    }

    receive("deposit") minAmount(ton("0.1")) {
        dump("Deposit received");
    }
}
```

# Error Codes

When a transaction fails, it is often useful to return a specific error code to indicate the reason for the failure. This can help with debugging and provide more information to the user.

Error codes are defined using the `error` keyword followed by the error code and the error message. Error codes can be any integer value.

Error codes can be returned using the `throw` function followed by the error code.

```tact
import "@stdlib/deploy";

error Code1 = 100;
error Code2 = 200;

contract ErrorCodes with Deployable {

    receive("test1") {
        throw(Code1);
    }

    receive("test2") {
        throw(Code2);
    }
}
```
```


