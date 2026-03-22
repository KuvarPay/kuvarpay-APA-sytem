# Transfer

### Supported Payout Currencies & Channels.

| Currency           | Payout Channel                 |
| ------------------ | ------------------------------ |
| NGN- Nigeria       | Bank Transfer                  |
| GHS- Ghana         | Bank Transfer and Mobile Money |
| ZAR- South Africa  | Bank Transfer                  |
| KES- Kenya         | Mobile Money and Bank Transfer |
| UGX- Uganda        | Mobile Money                   |
| RWF- Rwanda        | Mobile Money                   |
| TZS- Tanzania      | Mobile Money                   |
| XOF- Côte d'Ivoire | Mobile Money                   |
| ZMW- Zambia        | Mobile Money                   |

For more Payout details check [here](https://startbutton.gitbook.io/startbutton-product-api/available-currencies#for-payouts):

### Initiate transfer

<table><thead><tr><th width="224">Authorization</th><th>Set to Bearer SECRET_KEY</th></tr></thead><tbody><tr><td>Content-Type</td><td>Set value to <code>application/json</code></td></tr></tbody></table>

{% hint style="info" %}
The secret key can be gotten from the 'Settings' page on your Startbutton dashboard.&#x20;
{% endhint %}

Post a request to the URL below, where the base URL is determined by the environment you are in.

<details>

<summary>BaseUrl</summary>

Sandbox/PROD: <https://api.startbutton.tech&#x20>;

</details>

{% tabs %}
{% tab title="Endpoint" %}
POST  `{{baseurl}}/transaction/transfer`
{% endtab %}
{% endtabs %}

#### Here are sample requests below.

{% tabs %}
{% tab title="NGN Bank transfer (required parameters)" %}

```
{
    "amount": 2000,
    "currency": "NGN",
    "country": "Nigeria",
    "bankCode": "057",
    "accountNumber": "1951772514216"
    "reference": "78teguy3rqxxxxx" //optional
}
```

{% endtab %}

{% tab title="GHS Bank transfer" %}

```
{
    "amount": 1000,
    "currency": "GHS",
    "country": "Ghana",
    "bankCode": "240100",
    "accountNumber": "1056772514218"
    "reference": "78teguy3rqxxxxx" //optional
}
```

{% endtab %}

{% tab title="Bank transfer (ZAR)" %}

```
{
    "amount": 100,
    "currency": "ZAR",
    "country": "South Africa",
    "bankCode": "250655",
    "accountNumber": "630xxxxxxxx",
    "accountName": "John Doe"
}
```

{% endtab %}

{% tab title="GHS Mobile money (required parameters)" %}

```
{
    "amount": 580000,
    "currency": "GHS",
    "MNO": "MTN",
    "msisdn": "0551234987",
    "country": "Ghana"
    "reference": "80qetie3rqxxxxx" //optional
}
```

{% endtab %}

{% tab title="KES Bank transfer (required params)" %}

```
{
    "amount": 1000,
    "currency": "KES",
    "country": "Kenya",
    "bankCode": "57",
    "accountNumber": "032xxxxxx"
    "accountName": "John Doe" //optional
}
```

{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="KES Mobile money  (required parameters)" %}

```
{
    "amount": 120000,
    "currency": "KES",
    "MNO": "MPESA",
    "msisdn": "071000000",
    "country": "Kenya"
}
```

{% endtab %}

{% tab title="UGX Mobile money (required parameters)" %}

```
{
    "amount": 580000,
    "currency": "UGX",
    "MNO": "MTN",
    "msisdn": "+256101010111",
    "country": "Uganda"
}
```

{% endtab %}

{% tab title="RWF (Mobile Money)" %}

```
{
    "amount": 1000,
    "currency": "RWF",
    "country": "Rwanda",
    "MNO": "MTN",
    "msisdn": "123123123"
}
```

{% endtab %}

{% tab title="Required Param for ZMW (Mobile Money) " %}

```
{
    "amount": 2700,
    "currency": "ZMW",
    "MNO": "zm_airtel",
    "msisdn": "260970000100",
    "country": "Zambia"
}
```

{% endtab %}

{% tab title="XOF (Mobile Money)" %}

```
 {
    "amount": 20500,
    "currency": "XOF",
    "msisdn": "+2250707000200",
    "country": "Côte d'Ivoire",
    "MNO": "ORANGE_CI"
    "recipientFirstName": "Cheid", // optional
    "recipientLastName": "Cheid", // optional
    "reference": "test8489273" // optional
}  
```

{% endtab %}

{% tab title="TZS required param" %}

```
{
        "amount": 100000,
        "country": "Tanzania",
        "currency": "TZS",
        "MNO": "MTN",
        "msisdn": "+255121212121"
}
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Note**:\
`bankCode/MNO` is dependent on the bank[^1] or mobile money operator, this can be gotten from our [bank list](https://startbutton.gitbook.io/startbutton-product-api/startbutton-api-doc/transfer/bank-list)

Account validation for ZAR transfers is currently not available. Interested merchants will be notified and the documentation updated once this is available.
{% endhint %}

A transfer reference is a unique code that enables you to track, manage, and reconcile each transfer request in your integration. It helps prevent duplicate transactions. Ensure your reference has at least 16 alphanumeric characters and a maximum of 100 characters.

To benefit from this transfer reference system, you should generate and include it for every request. However, if you do not provide a reference or the provided reference does not conform to the required format, a reference would be automatically generated on your behalf in place of the provided one.

#### Here are sample responses below.

{% tabs %}
{% tab title="Processing" %}
{% code title="Sample response              200" %}

```json
{
    "success": true,
    "message": "transfer",
    "data": "processing"
}
```

{% endcode %}
{% endtab %}

{% tab title="Insufficient funds" %}
{% code title="Sample response              400" %}

```json
{
    "success": false,
    "message": "Insufficient funds in GHS wallet"
}
```

{% endcode %}
{% endtab %}

{% tab title="Duplicate reference" %}
{% code title="Sample response              409" %}

```json
{
    "success": false,
    "message": "Duplicate transaction"
}
```

{% endcode %}
{% endtab %}

{% tab title="Daily transaction limit" %}
{% code title="Sample response              400" %}

```json
{
    "success": false,
    "message": "You can only send 9xxxxxNGN more today"
}
```

{% endcode %}
{% endtab %}

{% tab title="Resolution Issue" %}
{% code title="Sample response              400" fullWidth="true" %}

```json
{
    "success": false,
    "message": "Could not resolve account name. Check parameters or try again."
}
```

{% endcode %}
{% endtab %}

{% tab title="Omission in required parameter" %}

```
{
    "success": false,
    "message": "either a bankCode and accountNumber pair or MNO and msisdn pair is required for transfer"
}
```

{% endtab %}
{% endtabs %}

All merchants are subject to a standard daily transaction limit of N1 million (Naira) and an equivalent of $500 in other currencies. To transfer above this, please contact our support team via email (<support@startbutton.africa>)

#### Transaction statuses

Currently we have 6 transaction statuses namely;

<table><thead><tr><th width="170">Status</th><th width="301">Description</th><th>Conclusive?</th></tr></thead><tbody><tr><td><code>Initiated</code></td><td>The transaction has been initiated for payment</td><td>No</td></tr><tr><td><code>Pending</code> </td><td>Transaction has been picked up for processing</td><td>No</td></tr><tr><td><code>Processing</code> </td><td>The transfer has been picked up by our payment partner and awaiting confirmation</td><td>No</td></tr><tr><td><code>Successful</code> </td><td>The transfer has been acknowledged and processed successfully.</td><td>Yes</td></tr><tr><td><code>Failed</code> </td><td>Transfer could not be processed. </td><td>Yes</td></tr><tr><td><code>Reversed</code> </td><td>The transfer was successful but we got reversed by the receiver's bank or operator. This usually signifies that the customer's bank is currently unable to accept the funds. In such cases, the transfer amount is refunded. The merchant has the option to attempt the transfer again at a later time.</td><td>Yes</td></tr></tbody></table>

### Custom Webhook for Payout

To learn more about custom webhook function, see [here](https://startbutton.gitbook.io/startbutton-product-api/accept-payments#custom-webhook-url)

{% tabs %}
{% tab title="Payload with custom webhook URL" %}

```
{
    "amount": 50000,
    "currency": "NGN",
    "country": "Nigeria",
    "bankCode": "50xxx",
    "accountNumber": "200XXXXXX",
    "webhookUrl": "https://webhook.site/e9d63f59-d13d-4db7-a07d-8ecd25443b22"
    // "reference": "78teguy3rqxxxxx" //optional
}
```

{% endtab %}
{% endtabs %}

### Verify transfer

Stay up to date with the status of your transaction. Once the status of a transaction changes, a [webhook notification is sent](https://startbutton.gitbook.io/startbutton-product-api/startbutton-api-doc/webhook). You can also retrieve the status of your transfer by calling the [transaction status endpoint.](https://startbutton.gitbook.io/startbutton-product-api/startbutton-api-doc/transaction-status)

### Supported Currencies for Transfer

Check out the Amount Limits and Settlement Timeline for each currency [here](https://startbutton.gitbook.io/startbutton-product-api/available-currencies#for-payouts).

[^1]:
