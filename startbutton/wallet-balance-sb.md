# Get Wallet Balance

| Authorization | Set value to \`Bearer SECRET\_KEY\` |
| ------------- | ----------------------------------- |
| Content-type  | Set value to `application/json`     |

<details>

<summary>BaseUrl</summary>

Sandbox/PROD: <https://api.startbutton.tech&#x20>;

</details>

{% tabs %}
{% tab title="Endpoint" %}
GET `{{baseurl}}/wallet`
{% endtab %}
{% endtabs %}

Once a call is initiated, we return your wallet balances across all currencies.

**Sample response:**

```
{
    "success": true,
    "message": "Wallet",
    "data": [
        {
            "_id": "****b082****09cac****",
            "currency": "GHS",
            "availableBalance": 9737980,
            "ledgerBalance": 11266337,
            "createdAt": "2023-07-31T18:06:19.011Z",
            "updatedAt": "2024-07-10T14:30:05.598Z",
            "__v": 0
        },
        {
            "_id": "****8e5a3****a6d*****",
            "currency": "KES",
            "availableBalance": 3842517,
            "ledgerBalance": 3659155,
            "createdAt": "2023-10-06T09:25:34.497Z",
            "updatedAt": "2024-07-01T11:26:24.370Z",
            "__v": 0
        },
        {
            "_id": "*****13e****43cd51****",
            "currency": "NGN",
            "availableBalance": 349701483,
            "ledgerBalance": 532922397,
            "createdAt": "2023-07-31T14:12:14.837Z",
            "updatedAt": "2024-07-21T14:44:00.680Z",
            "__v": 0
       }
    ]
}
```
