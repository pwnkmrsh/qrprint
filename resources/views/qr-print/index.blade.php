<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>QR Print POC</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 1000px;
            margin: auto;
        }

        .card {
            background: #fff;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 12px;
            box-shadow: 0 3px 12px rgba(0, 0, 0, .08);
        }

        input,
        textarea {
            width: 100%;
            padding: 12px;
            margin: 8px 0 15px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 6px;
        }

        button {
            background: #2563eb;
            color: white;
            border: 0;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }

        .qr {
            width: 100px;
        }

        .success {
            background: #dcfce7;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 6px;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="card">

        <h1>QR Print POC</h1>

        @if(session('success'))
            <div class="success">
                {{ session('success') }}
            </div>
        @endif

        @if($errors->any())
            <div class="success">
                @foreach($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('qr-print.store') }}">

            @csrf

            <label>Document Title</label>

            <input
                type="text"
                name="title"
                placeholder="Example: Test Document"
                required
            >

            <label>Content</label>

            <textarea
                name="content"
                rows="4"
                placeholder="Enter printable content..."
            ></textarea>

            <button type="submit">
                Generate QR
            </button>

        </form>

    </div>


    <div class="card">

        <h2>Generated QR Codes</h2>

        <table>

            <thead>

            <tr>
                <th>Document</th>
                <th>QR</th>
                <th>Print Count</th>
                <th>Action</th>
            </tr>

            </thead>

            <tbody>

             @foreach($prints as $print)

    <div class="qr-card">

        <h3>{{ $print->title }}</h3>

        <img
            src="{{ route('qr-print.qr', $print) }}"
            alt="QR Code"
            width="250"
            height="250"
        >

        <p>
            📱 Scan this QR from mobile
        </p>

        <p>
            <small>
                {{ route('qr-print.print', [
                    'token' => $print->print_token
                ]) }}
            </small>
        </p>

    </div>

@endforeach

                <tr>
                    <td colspan="4">
                        No QR codes created yet.
                    </td>
                </tr>
 

            </tbody>

        </table>

    </div>

</div>

</body>
</html>