# Webhook

Webhooks allow you to set up a notification system that can be used to receive updates on certain requests made to the Startbutton API.

With webhooks, Startbutton sends updates to your server when the status of your request changes. You will typically listen to these events on your webhook URL - a `POST` endpoint, the URL needs to parse a JSON request and return a `200 OK`.

We send webhooks for the following transaction types:

1. Collections
2. Transfers
3. Conversions

### Supported events for payment collection:

1. collection.verified
2. collection.completed

{% tabs %}
{% tab title="Verified" %}

```json
{
  "event": "collection.verified",
  "data": {
    "transaction": {
      "_id": "65042a1a0d32920xxxxxxxxx",
      "transType": "collection",
      "status": "verified",
      "merchantId": "64c7bd870821e83xxxxxxxxx",
      "transactionReference": "be6eaxxxxxxx",
      "customerEmail": "test@customer.com",
      "userTransactionReference": "aedxxxx",
      "paymentCode": "a78a18df1fdc1fa7f2fb665b54afa21cf1c0d81b741f44527989f492e2a6094cdb24281fb7d577c4636978xxxxxxxxxx",
      "isRecurrent": false,
      "postProcess": null,
      "gatewayReference": null,
      "createdAt": "2023-09-15T09:55:38.492Z",
      "updatedAt": "2023-09-15T09:57:30.522Z",
      "feeAmount": 115500,
      "narration": "Approved",
      "amount": 1030000,
      "currency": "ZAR"
    },
    "authorizationCode": null
  }
}
```

{% endtab %}

{% tab title="Completed" %}

```json
{
  "event": "collection.completed",
  "data": {
    "transaction": {
      "_id": "65042a1a0d3292066xxxxxxx",
      "transType": "collection",
      "status": "successful",
      "merchantId": "64c7bd870821e831cxxxxxxx",
      "transactionReference": "be6eaxxxxxxx",
      "customerEmail": "test@customer.com",
      "userTransactionReference": "aedxxxx",
      "paymentCode": "a78a18df1fdc1fa7f2fb665b54afa21cf1c0d81b741f44527989f492e2a6094cdb24281fb7d577c4636978xxxxxxxxxx",
      "isRecurrent": false,
      "postProcess": null,
      "gatewayReference": null,
      "createdAt": "2023-09-15T09:55:38.492Z",
      "updatedAt": "2023-09-15T09:59:01.089Z",
      "feeAmount": 115500,
      "narration": "Successful",
      "amount": 1030000,
      "currency": "ZAR"
    },
    "authorizationCode": null
  }
}
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
`amount` is in fractional unit
{% endhint %}

### Webhook for DVA top-up:

When top-up is done to you DVA, you should expect this webhook format:

```
{
  "event": "topup.successful",
  "data": {
    "transaction": {
      "_id": "68e38f170899ef52f107dcc1",
      "transType": "topup",
      "status": "successful",
      "feeAmount": 4200,
      "merchantId": "6569d0c4bxxxxxxxxxx",
      "transactionReference": "25b8exxxxx",
      "customerEmail": "Topup account",
      "paymentPartnerId": "65c1e6e7dcaa5xxxxxxx",
      "isRecurrent": false,
      "dvaAccountNumber": 0123456778,
      "createdAt": "2025-10-06T09:42:47.659Z",
      "updatedAt": "2025-10-06T09:42:47.659Z",
      "amount": 200000,
      "currency": "NGN",
      "initialAmount": 200000,
      "narration": "Topup account"
    },
    "authorizationCode": null,
    "payerInformation": {
      "sessionId": "",
      "accountNumber": "******0000",
      "bankName": "TEST BANK"
    }
  }
}
```

### Supported events for transfer:

* transfer.pending
* transfer.successful
* transfer.failed
* transfer.reversed

{% tabs %}
{% tab title="Successful" %}

```json
{
  "event": "transfer.successful",
  "data": {
    "transaction": {
      "_id": "65042e420d3292066xxxxxxx",
      "transType": "transfer",
      "status": "successful",
      "feeAmount": 15,
      "merchantId": "64c7bd870821e831xxxxxxxx",
      "transactionReference": "6342d3xxxxxx",
      "isRecurrent": false,
      "gatewayReference": "6342d3xxxxxx",
      "createdAt": "2023-09-15T10:13:22.438Z",
      "updatedAt": "2023-09-15T10:13:25.212Z",
      "amount": 5000,
      "currency": "NGN",
      "recipient": {
        "recipientName": "JOHN DOE JAMES",
        "currency": "NGN",
        "institutionType": "nuban",
        "institutionName": "Zenith Bank",
        "institutionNumber": "2007xxxxxx",
        "_id": "64f4fb7e605c5280xxxxxxx"
      }
    },
    "authorizationCode": null
  }
```

{% endtab %}

{% tab title="Successful (KES)" %}

```
{
  "event": "transfer.successful",
  "data": {
    "transaction": {
      "_id": "65e8xxxxxxxxxxxxxx",
      "transType": "transfer",
      "status": "successful",
      "feeAmount": 0,
      "merchantId": "64c7bd8xxxxxxxxxxxxx",
      "transactionReference": "df11xxxxxx",
      "isRecurrent": false,
      "createdAt": "2024-03-06T16:23:00.016Z",
      "updatedAt": "2024-03-06T16:23:02.957Z",
      "gatewayReference": "df11xxxxxxxx",
      "fromBalanceAfterLedger": 0,
      "fromBalanceAfterAvailable": 0,
      "toBalanceAfterLedger": 0,
      "toBalanceAfterAvailable": 0,
      "amount": 100,
      "currency": "KES",
      "recipient": {
        "recipientName": "11 - 07xxxxxxx",
        "currency": "KES",
        "institutionType": "mobile_money",
        "institutionName": "11",
        "institutionNumber": "07xxxxxxxx",
        "_id": "65e8xxxxxxxxxxxx"
      },
    },
    "authorizationCode": "1eexxxxxxxxx"
  }
}
```

{% endtab %}

{% tab title="Pending" %}

```json
{
  "event": "transfer.pending",
  "data": {
    "transaction": {
      "_id": "65042e420d3292066xxxxxxx",
      "transType": "transfer",
      "status": "pending",
      "feeAmount": 15,
      "merchantId": "64c7bd870821e831xxxxxxxx",
      "transactionReference": "6342d3xxxxxx",
      "isRecurrent": false,
      "gatewayReference": "6342d3xxxxxx",
      "createdAt": "2023-09-15T10:13:22.438Z",
      "updatedAt": "2023-09-15T10:13:25.212Z",
      "amount": 5000,
      "currency": "NGN",
      "recipient": {
        "recipientName": "JOHN DOE JAMES",
        "currency": "NGN",
        "institutionType": "nuban",
        "institutionName": "Zenith Bank",
        "institutionNumber": "2007xxxxxx",
        "_id": "64f4fb7e605c5280xxxxxxx"
      }
    },
    "authorizationCode": null
  }
```

{% endtab %}

{% tab title="Failed" %}

```json
{
  "event": "transfer.failed",
  "data": {
    "transaction": {
      "_id": "65042e420d3292066xxxxxxx",
      "transType": "transfer",
      "status": "failed",
      "feeAmount": 0,
      "merchantId": "64c7bd870821e831xxxxxxxx",
      "transactionReference": "6342d3xxxxxx",
      "isRecurrent": false,
      "gatewayReference": "6342d3xxxxxx",
      "createdAt": "2023-09-15T10:13:22.438Z",
      "updatedAt": "2023-09-15T10:13:25.212Z",
      "amount": 5000,
      "currency": "NGN",
      "recipient": {
        "recipientName": "JOHN DOE JAMES",
        "currency": "NGN",
        "institutionType": "nuban",
        "institutionName": "Zenith Bank",
        "institutionNumber": "2007xxxxxx",
        "_id": "64f4fb7e605c5280xxxxxxx"
      }
    },
    "authorizationCode": null
  }
```

{% endtab %}

{% tab title="Reversed" %}

```json
{
  "event": "transfer.reversed",
  "data": {
    "transaction": {
      "_id": "65042e420d3292066xxxxxxx",
      "transType": "transfer",
      "status": "reversed",
      "feeAmount": 0,
      "merchantId": "64c7bd870821e831xxxxxxxx",
      "transactionReference": "6342d3xxxxxx",
      "isRecurrent": false,
      "gatewayReference": "6342d3xxxxxx",
      "createdAt": "2023-09-15T10:13:22.438Z",
      "updatedAt": "2023-09-15T10:13:25.212Z",
      "amount": 5000,
      "currency": "NGN",
      "recipient": {
        "recipientName": "JOHN DOE JAMES",
        "currency": "NGN",
        "institutionType": "nuban",
        "institutionName": "Zenith Bank",
        "institutionNumber": "2007xxxxxx",
        "_id": "64f4fb7e605c5280xxxxxxx"
      }
    },
    "authorizationCode": null
  }
```

{% endtab %}
{% endtabs %}

### **Supported events for Conversion :**

1. conversion.successful
2. conversion.pending
3. conversion.failed

{% tabs %}
{% tab title="Successful " %}

```
{
  "event": "conversion.successful",
  "data": {
    "transaction": {
      "_id": "66xxxxxxxxxxxx",
      "transType": "conversion",
      "status": "successful",
      "fromAmount": 1000,
      "toAmount": 1593050,
      "fromCurrency": "USD",
      "toCurrency": "NGN",
      "merchantId": "65xxxxxxxxxx",
      "transactionReference": "dbxxxxxxx",
      "isRecurrent": false,
      "createdAt": "2024-08-25T23:44:33.513Z",
      "updatedAt": "2024-08-25T23:44:37.346Z",
      "amount": 100000,
      "currency": "USD",
      "feeAmount": null
    },
    "authorizationCode": null
  }
}
```

{% endtab %}

{% tab title="Pending " %}

```
{
  "event": "conversion.pending",
  "data": {
    "transaction": {
      "_id": "66cxxxxxxxxxxxx",
      "transType": "conversion",
      "status": "initiated",
      "fromAmount": 1000,
      "toAmount": 1593050,
      "fromCurrency": "USD",
      "toCurrency": "NGN",
      "merchantId": "65xxxxxxxxxxx",
      "transactionReference": "dbxxxxxxxx",
      "isRecurrent": false,
      "createdAt": "2024-08-25T23:44:33.513Z",
      "currency": "USD",
      "feeAmount": null
    },
    "authorizationCode": null
  }
}
```

{% endtab %}

{% tab title="Failed " %}

```
{
  "event": "conversion.failed",
  "data": {
    "transaction": {
      "_id": "66xxxxxxxxxxxxxxx",
      "transType": "conversion",
      "status": "failed",
      "merchantId": "65xxxxxxxxxxxxx",
      "transactionReference": "f1418761c7ab",
      "isRecurrent": false,
      "createdAt": "2024-08-23T08:41:32.036Z",
      "updatedAt": "2024-08-23T08:41:32.247Z",
      "amount": 1000000,
      "currency": "USD",
      "feeAmount": null
    },
    "authorizationCode": null
  }
}
```

{% endtab %}
{% endtabs %}

### **Supported events for Disputes:**

1. dispute.created
2. dispute.declined
3. dispute.processed

{% hint style="info" %}
We support 2 dispute type:- full value and partial value
{% endhint %}

{% tabs %}
{% tab title="dispute.created" %}

```
{
  "event": "dispute.created",
  "data": {
    "transactionReference": "4237ed5bxxxx",
    "disputeReference": "DSHC-WCUDS6RYDI",
    "currency": "UGX",
    "amount": 120000,
    "elapseTime": "24",
    "type": "full",
    "customerEmail": "johndoe@startbutton.africa",
    "createdAt": "2025-10-17T10:48:45.131Z",
    "status": "initiated",
    "reason": "chargeback"
  }
}
```

{% endtab %}

{% tab title="dispute.processed" %}

```

  "event": "dispute.processed",
  "data": {
    "transactionReference": "4237ed5bxxxx",
    "disputeReference": "DSHC-WCUDS6RYDI",
    "currency": "UGX",
    "amount": 120000,
    "type": "full",
    "customerEmail": "johndoe@startbutton.africa",
    "createdAt": "2025-10-17T10:56:51.767Z",
    "status": "processed",
    "reason": "chargeback"
  
```

{% endtab %}

{% tab title="dispute.declined" %}

```

  "event": "dispute.processed",
  "data": {
    "transactionReference": "4237ed5bxxxx",
    "disputeReference": "DSHC-WCUDS6RYDI",
    "currency": "UGX",
    "amount": 120000,
    "type": "full",
    "customerEmail": "johndoe@startbutton.africa",
    "createdAt": "2025-10-17T10:56:51.767Z",
    "status": "declined",
    "reason": "chargeback"
  
```

{% endtab %}
{% endtabs %}

### Webbook Samples for Under and Overpaid transactions:

<details>

<summary>Overpayment webhook behavior:</summary>

When an overpayment occurs, two separate webhooks are triggered:

1. **Expected Transaction Webhook**
2. **Overpaid Transaction Webhook**

**Breakdown**

1. **Expected Transaction Webhook**:
   &#x20;This is the first webhook sent. It represents the original expected transaction and includes an indicator that the amount received exceeded the expected value.

* Look out for the field:

```json
"isOverPaid": true
```

* This means the amount received was **greater than** the expected amount.
* Note: The expected amount is treated as a **standalone transaction**, even in the case of overpayment.

2. **Overpaid Transaction Webhook:** This second webhook captures the excess amount paid. It is treated as a new transaction record, with a unique reference.

* It includes an `extraInformation` object, which contains details about the original transaction the overpayment is linked to.
* The overpaid value is recorded under the field:

```json
"amount": <value_in_fractional_units>

```

</details>

{% tabs %}
{% tab title="Underpayment" %}

<pre class="language-json"><code class="lang-json"><strong>{
</strong>  "event": "collection.verified",
  "data": {
    "transaction": {
      "_id": "67d946xxxx",
      "transType": "collection",
      "status": "successful",
      "merchantId": "64xxxxxxxxxxxx",
      "transactionReference": "09026725031811120xxxxxxxx",
      "customerEmail": "test@customer.com",
      "paymentPartnerId": "65fbxxxxxxxx",
      "isRecurrent": false,
      "postProcess": null,
      "createdAt": "2025-03-18T10:12:08.298Z",
      "updatedAt": "2025-03-18T10:12:08.298Z",
      "amount": 20000,
      "currency": "NGN",
      "feeAmount": null
    },
    "authorizationCode": null,
    "extraInformation": {
      "originalReference": "c066f854fa8a",
      "userTransactionReference": "BTS2013",
      "expectedAmount": 200000,
      "paymentCollectionType": "UNDERPAYMENT",
      }
    "payerInformation": {
      "sessionId": "090267250xxxxxxxxxx",
      "accountNumber": "**********",
      "bankName": "KUDA MICROFINANCE BANK"
    }
  }
}
</code></pre>

{% endtab %}

{% tab title="First Webhook for Overpaid trnxs" %}

```json
{
  "event": "collection.completed",
  "data": {
    "transaction": {
      "_id": "687xxxxxxxxxxxxxxxx",
      "transType": "collection",
      "status": "successful",
      "merchantId": "648xxxxxxxxxxxxxxxx",
      "transactionReference": "b91f8xxxxx",
      "customerEmail": "tester@gmail.com",
      "paymentPartnerId": "65fbxxxxxxxxxxxxxxxxx",
      "paymentCode": "f35xxxxxxxxx",
      "isRecurrent": false,
      "postProcess": null,
      "createdAt": "2025-07-18T11:02:51.706Z",
      "updatedAt": "2025-07-18T11:04:24.635Z",
      "feeAmount": 10240,
      "amount": 20000,
      "currency": "NGN",
      "initialAmount": 20000
    },
    "authorizationCode": null,
    "extraInformation": {
      "isOverPaid": true
    }
  }
}
```

{% endtab %}

{% tab title="Second Webhook for Overpayment" %}

<pre class="language-json"><code class="lang-json"><strong>{
</strong>  "event": "collection.verified",
  "data": {
    "transaction": {
      "_id": "67d946xxxx",
      "transType": "collection",
      "status": "successful",
      "merchantId": "64xxxxxxxxxxxx",
      "transactionReference": "0102672556781120xxxxxxxx",
      "customerEmail": "test@customer.com",
      "paymentPartnerId": "65fb3c11xxxxxx",
      "isRecurrent": false,
      "postProcess": null,
      "createdAt": "2025-03-18T10:12:08.298Z",
      "updatedAt": "2025-03-18T10:12:08.298Z",
      "amount": 2000000,
      "currency": "NGN",
      "feeAmount": null
    },
    "authorizationCode": null,
    "extraInformation": {
      "originalReference": "b079dxxx",
      "userTransactionReference": "TEST613",
      "expectedAmount": 100000,
      "paymentCollectionType": "OVERPAYMENT"
    },
    "payerInformation": {
      "sessionId": "01678954xxxxxxxxxx",
      "accountNumber": "**********",
      "bankName": "KUDA MICROFINANCE BANK"
    }
  }
}
</code></pre>

{% endtab %}
{% endtabs %}

{% hint style="info" %}
If we have any issues sending you a webhook, we retry the webhook 5 times.

If a `reference` is passed when initiating a transaction; a `userTransactionReference` will be returned in your webhook for complete transactions as well as under or overpayments.\
\
The `userTransactionReference`will have the value passed in as reference during initialization
{% endhint %}

### Webhook Verification

To ascertain that the request you received on your webhook is legit and not a bad actor, it's recommended that the webhook response is verified.

Events sent from Startbutton carry the `x-startbutton-signature`  header. The value of this header is a `HMAC SHA512` signature of the event payload signed using your secret key. Verifying the header signature should be done before processing the event.

Here is a sample code showing the webhook verification

{% tabs %}
{% tab title="Node (Express)" %}

```javascript
var crypto = require('crypto');
var secret = process.env.MERCHANT_SECRET_KEY;
// Using Express
app.post("/my/webhook/url", function(req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-startbutton-signature']) {
    // Retrieve the request's body
    const event = req.body;
    // Do something with event  
    }
    res.send(200);
});
```

{% endtab %}

{% tab title="C#" %}

<pre class="language-csharp"><code class="lang-csharp">using System;
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

public class WebhookController : ControllerBase
{
    private readonly string secret = Environment.GetEnvironmentVariable("MERCHANT_SECRET_KEY");

    [HttpPost("/my/webhook/url")]
    public IActionResult HandleWebhook([FromBody] WebhookData requestBody)
    {
        // Convert the request body to JSON
        string jsonBody = JsonConvert.SerializeObject(requestBody);

        // Validate the event
        string hash = CalculateHash(jsonBody);

        if (hash == Request.Headers["x-startbutton-signature"])
        {
            // Request is valid, process the event
            // You can access the JSON data in 'requestBody'
            // Do something with the event
        }

        return Ok();
    }

    private string CalculateHash(string data)
    {
        using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret)))
        {
            byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }
    
    
<strong>    public class WebhookData
</strong>    {
        public string @event { get; set; }
        public WebhookDataObj data { get; set; }
    }
 

    public class WebhookDataObj
    {
        public WebhookTransaction transaction { get; set; }
        public string authorizationCode { get; set; }
    }

    public class WebhookTransaction
    {
        public string _id { get; set; }
        public string transType { get; set; }
        public string status { get; set; }
        public string merchantId { get; set; }
        public string transactionReference { get; set; }
        public string customerEmail { get; set; }
        public string paymentPartnerId { get; set; }
        public string paymentCode { get; set; }
        public string userTransactionReference { get; set; }
        public bool isRecurrent { get; set; }
        public string postProcess { get; set; }
        public string createdAt { get; set; }
        public string updatedAt { get; set; }
        public int feeAmount { get; set; }
        public int amount { get; set; }
        public string currency { get; set; }

}

</code></pre>

}
{% endtab %}

{% tab title="Java (SpringBoot)" %}

```java
package com.example.demot;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;


@RestController
class WebhookController {

    private final String secret = System.getenv("MERCHANT_SECRET_KEY");
    private static final String HMAC_SHA512 = "HmacSHA512";

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestHeader("x-startbutton-signature") String signature,
                                           @RequestBody ReqObject requestBody) throws JsonProcessingException, NoSuchAlgorithmException, InvalidKeyException {

        String requestBodyString = new ObjectMapper().writeValueAsString(requestBody);
        String returnedHash = calculateHMAC(requestBodyString, secret);
        return returnedHash.equals(signature) ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    public static String calculateHMAC(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), HMAC_SHA512);
        Mac mac = Mac.getInstance(HMAC_SHA512);
        mac.init(secretKeySpec);
        byte[] bytes = mac.doFinal(data.getBytes());
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }

}

@Getter
@Setter
class ReqObject {
    private String event;
    private Data data;
}

@Getter
@Setter
class Data {
    private Transaction transaction;
    private Object authorizationCode;
}

@Getter
@Setter
class Transaction {
    private String _id;
    private String transType;
    private String status;
    private String merchantId;
    private String transactionReference;
    private String customerEmail;
    private String paymentCode;
    private String userTransactionReference;
    private Boolean isRecurrent;
    private String postProcess;
    private String createdAt;
    private String updatedAt;
    private Integer feeAmount;
    private Integer amount;
    private String currency;
}



```

{% endtab %}

{% tab title="Python (Flask)" %}

```python
import os
import json
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
secret = os.environ.get("MERCHANT_SECRET_KEY")

@app.route("/my/webhook/url", methods=["POST"])
def handle_webhook():
    # Get the request data as a JSON string
    request_data = request.data.decode("utf-8")

    # Validate the event
    hash_value = calculate_hash(request_data)

    if hash_value == request.headers.get("x-startbutton-signature"):
        # Request is valid, process the event
        event_data = json.loads(request_data)
        # Do something with the event data

    return "", 200

def calculate_hash(data):
    # Calculate HMAC-SHA512 hash of the data
    hmac = hashlib.new("sha512", secret.encode("utf-8"))
    hmac.update(data.encode("utf-8"))
    return hmac.hexdigest()

if __name__ == "__main__":
    app.run()

```

{% endtab %}

{% tab title="Ruby (Ruby on Rails)" %}

```ruby
class WebhookController < ApplicationController
  protect_from_forgery with: :null_session

  def handle_webhook
    secret = ENV['MERCHANT_SECRET_KEY']
    request_body = request.body.read
    signature = request.headers['x-startbutton-signature']

    if is_valid_signature?(secret, request_body, signature)
      # Request is valid, process the event
      event_data = JSON.parse(request_body)
      # Do something with the event data
    end

    head :ok
  end

  private

  def is_valid_signature?(secret, data, signature)
    calculated_signature = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha512'), secret, data)
    calculated_signature == signature
  end
end

```

{% endtab %}

{% tab title="PHP (laravel)" %}

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $secret = env('MERCHANT_SECRET_KEY');
        $requestBody = $request->getContent();
        $signature = $request->header('x-startbutton-signature');

        if ($this->isValidSignature($secret, $requestBody, $signature)) {
            // Request is valid, process the event
            $eventData = json_decode($requestBody, true);
            // Do something with the event data
        }

        return response()->json([], Response::HTTP_OK);
    }

    private function isValidSignature($secret, $data, $signature)
    {
        $calculatedSignature = hash_hmac('sha512', $data, $secret);
        return hash_equals($calculatedSignature, $signature);
    }
}

```

{% endtab %}
{% endtabs %}

### Final Notes

To wrap up your webhook implementation, here is the ideal flow your webhook endpoint should follow

1. Verify request is from us using secret key and payload sent
2. Re-query [transaction status](https://startbutton.gitbook.io/startbutton-product-api/startbutton-api-doc/transaction-status) after hit
3. Send 200 status back immediately and handle complex logic on your end
4. Ensure webhook responses are idempotent. Save the response and ensure value isn't give twice. since you can get multiple calls for a transaction.
