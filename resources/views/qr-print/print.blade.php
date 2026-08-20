<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>
        {{ $qrPrint->title }} - QR Print
    </title>
</head>

<body>

<div style="
    max-width:500px;
    margin:30px auto;
    padding:20px;
    font-family:Arial;
">

    <h2>
        🖨️ {{ $qrPrint->title }}
    </h2>

    <p>
        Upload your document to print.
    </p>

    @if(session('success'))
        <div style="
            background:#dcfce7;
            padding:12px;
            margin-bottom:15px;
        ">
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())

        <div style="
            background:#fee2e2;
            padding:12px;
            margin-bottom:15px;
        ">

            @foreach($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach

        </div>

    @endif

    <form
        method="POST"
        action="{{ route('qr-print.upload', [
            'token' => $qrPrint->print_token
        ]) }}"
        enctype="multipart/form-data"
    >

        @csrf

        <label>
            Select Document
        </label>

        <br><br>

        <input
            type="file"
            name="document"
            accept=".pdf,.jpg,.jpeg,.png"
            required
        >

        <br><br>

        <button
            type="submit"
            style="
                padding:12px 25px;
                background:#2563eb;
                color:white;
                border:0;
                border-radius:6px;
                font-size:16px;
            "
        >
            Upload Document
        </button>

    </form>

</div>

</body>
</html>