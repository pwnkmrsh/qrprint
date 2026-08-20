<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>{{ $qrPrint->title }}</title>

    <style>

        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f3f4f6;
        }

        .print-container {
            max-width: 800px;
            margin: auto;
            background: white;
            padding: 40px;
            min-height: 800px;
        }

        .header {
            text-align: center;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .content {
            white-space: pre-wrap;
            font-size: 18px;
            line-height: 1.7;
        }

        .print-button {
            display: block;
            margin: 20px auto;
            padding: 14px 30px;
            background: #2563eb;
            color: white;
            border: 0;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }

        @media print {

            body {
                background: white;
                padding: 0;
            }

            .print-container {
                max-width: none;
                padding: 20mm;
                min-height: auto;
            }

            .no-print {
                display: none !important;
            }

        }

    </style>

</head>

<body>

<button
    class="print-button no-print"
    onclick="startPrint()"
>
    🖨️ Print Document
</button>


<div class="print-container">

    <div class="header">

        <h1>{{ $qrPrint->title }}</h1>

        <p>
            Document ID:
            {{ $qrPrint->uuid }}
        </p>

    </div>


    <div class="content">

        {{ $qrPrint->content }}

    </div>

</div>


<script>

function startPrint() {

    fetch(
        "{{ route('qr-print.printed', $qrPrint) }}",
        {
            method: "POST",

            headers: {
                "X-CSRF-TOKEN":
                    "{{ csrf_token() }}",

                "Accept":
                    "application/json"
            }
        }
    )
    .finally(function () {

        window.print();

    });

}

</script>

</body>

</html>