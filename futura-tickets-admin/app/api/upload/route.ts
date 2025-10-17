import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileName = setFileName(new Date().getTime().toString(), file.type);
        formData.set('file', file, fileName);

        // Make the API call
        await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/upload`, {
            method: 'POST',
            body: formData,
        });

        return NextResponse.json({ name: fileName });

    } catch (error) {
        console.log('ERROR!');
      throw new Error(`API request failed with status ${error}`);
    }
}

function setFileName(fileName: string, fileType: string): string {
  if (fileType == 'image/jpeg') return `${fileName}.jpeg`;
  if (fileType == 'image/png') return `${fileName}.png`;
  return '';
}