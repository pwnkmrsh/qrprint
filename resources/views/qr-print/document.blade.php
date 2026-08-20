<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>{{ $document->original_name }}</title>

    <style>
        body {
            margin: 0;
            background: #f3f4f6;
            font-family: Arial, sans-serif;
        }

        .toolbar {
            position: sticky;
            top: 0;
            background: white;
            padding: 15px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
            z-index: 10;
        }

        button {
            padding: 13px 30px;
            background: #2563eb;
            color: white;
            border: 0;
            border-radius: 7px;
            font-size: 16px;
        }

        .preview {
            padding: 20px;
            text-align: center;
        }

        iframe {
            width: 100%;
            height: 75vh;
            border: 0;
            background: white;
        }

        img {
            max-width: 100%;
            max-height: 75vh;
        }

        @media print {

            .no-print {
                display: none !important;
            }

            .preview {
                padding: 0;
            }

            iframe {
                height: auto;
            }

        }
    </style>

</head>

<body>

    <div class="toolbar no-print">

        <strong>
            {{ $document->original_name }}
        </strong>

        <br><br>

       <button
    type="button"
    id="printButton"
    onclick="createPrintJob()"
>
    🖨️ Print Now
</button>

    </div>


    @php
    $fileUrl = asset('storage/' . $document->path);
    @endphp

    <div class="preview">

        @if(strtolower($document->mime_type) === 'application/pdf')

        <iframe
            src="{{ $fileUrl }}"
            style="
                width: 100%;
                height: 80vh;
                border: 0;
                background: white;
            "></iframe>

        @elseif(in_array(strtolower($document->mime_type), [
        'image/jpeg',
        'image/png',
        'image/jpg'
        ]))

        <img
            src="{{ $fileUrl }}"
            alt="{{ $document->original_name }}"
            style="
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
            ">

        @else

        <p>
            Preview is not available for this file type.
        </p>

        <a
            href="{{ $fileUrl }}"
            target="_blank">
            Open / Download File
        </a>

        @endif

    </div>


    <script>
 async function createPrintJob()
{
    const button = document.getElementById('printButton');

    if (!button) {
        console.error('Print button not found.');
        return;
    }

    button.disabled = true;
    button.innerText = 'Creating Print Job...';

    try {

        const response = await fetch(
            "{{ route('qr-print.document.create-job', [
                'token' => $qrPrint->print_token,
                'document' => $document->id
            ]) }}",
            {
                method: 'POST',

                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({})
            }
        );

        const text = await response.text();

        console.log('HTTP Status:', response.status);
        console.log('Server Response:', text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(
                `Server returned HTTP ${response.status}: ${text.substring(0, 500)}`
            );
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                data.error ||
                `HTTP ${response.status}`
            );
        }

        console.log('Print Job:', data);

        button.innerText = '✓ Print Job Created';

        alert(
            'Print job created successfully.\n\n' +
            'Job ID: ' + data.job_id
        );

    } catch (error) {

        console.error('PRINT JOB ERROR:', error);

        button.disabled = false;
        button.innerText = '🖨️ Print Now';

        alert(
            'Unable to create print job.\n\n' +
            error.message
        );
    }
}
</script>
</body>

</html>