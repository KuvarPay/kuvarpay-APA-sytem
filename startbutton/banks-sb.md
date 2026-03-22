# Bank List

### Authentication

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
GET `{{baseurl}}/bank/list/:currency?type=:type&countryCode=:countryCode`
{% endtab %}
{% endtabs %}

Here are sample requests below.

<table><thead><tr><th width="136">Param</th><th width="131">Param Type</th><th width="151">Required</th><th>Description</th><th data-hidden>Required?</th><th data-hidden>Description</th><th data-hidden></th><th data-hidden>Param Type</th></tr></thead><tbody><tr><td>currency</td><td>URL</td><td>Yes</td><td>Allowed values<br>NGN, GHS, ZAR, KES, UGX, RWF, TZS, and ZMW</td><td>Yes</td><td>Allowed values are: NGN, GHS, or KES</td><td></td><td>URL</td></tr><tr><td>type</td><td>Query</td><td>No</td><td>Allowed values<br><code>bank</code> and <code>mobile_money</code> defaults to <code>bank</code></td><td>No</td><td>Allowed values are: <code>bank</code> or <code>mobile_money</code> <br>Default value <code>bank</code></td><td></td><td>Query</td></tr><tr><td>countryCode</td><td>Query</td><td><p>Yes (Only for XOF)</p><p><br>Used to get the banklist for other XOF countries aside from Côte d'Ivoire (which is the default)</p></td><td>Allowed values: <code>BJ</code> for Benin, <code>CI</code> for Cote d’Ivoire, <code>TG</code> for Togo, <code>SN</code> for Senegal, <code>ML</code> for Mali, <code>BF</code> for Burkina Faso, <code>CM</code> for Camerouns  to <code>Côte d’Ivoire</code></td><td></td><td></td><td></td><td></td></tr></tbody></table>

{% hint style="info" %}
To see supported payment channel for these currencies check [here](https://startbutton.gitbook.io/startbutton-product-api/startbutton-api-doc/transfer/..#supported-payout-currencies).
{% endhint %}

Here is a sample response<br>

```json
{
    "success": true,
    "message": "Bank list retrieved",
    "data": [
        {
            "name": "9mobile 9Payment Service Bank",
            "code": "120001",
            "id": 302
        },
        {
            "name": "Abbey Mortgage Bank",
            "code": "404",
            "id": 174
        },
       ...
   ]
}
```

<br>

### Account Name Verification

This endpoint enables merchant verify the identity of the receiver of the transfer, it's recommended that the account name of the recipient is verified before a transfer is done. This is currently available for NGN and GHS only.

<table><thead><tr><th width="224">Authorization</th><th>Set to Bearer SECRET_KEY</th></tr></thead><tbody><tr><td>Content-Type</td><td>Set value to <code>application/json</code></td></tr></tbody></table>

{% hint style="info" %}
For MoMo pass the `msisdn` as accountNumber in your request.
{% endhint %}

{% tabs %}
{% tab title="Endpoint" %}
GET  `{{baseUrl}}/bank/verify?bankCode=000&accountNumber=6170***&countryCode=GH`
{% endtab %}
{% endtabs %}

{% hint style="info" %}
We don't support account validation for any other currency asides GHS and NGN.
{% endhint %}

{% hint style="info" %}
`countryCode` for Ghana is `GH` and not ~~GHS~~&#x20;

`countryCode` for Nigera is `NGN`
{% endhint %}

Here is a sample response:&#x20;

{% tabs %}
{% tab title="Successful" %}

```json
  {
    "success": true,
    "message": "successful",
    "data": {
        "account_number": "2009000000",
        "account_name": "JOHN DOE",
        "bank_id": 0
    }
}
```

{% endtab %}

{% tab title="Failed" %}

```json
{
    "success": false,
    "message": "Account not resolved"
}
```

{% endtab %}
{% endtabs %}
