import requests
import zipfile
import pandas as pd
import os
import io
import sys
import time
import datetime
from bs4 import BeautifulSoup
import pdfplumber
import xml.etree.ElementTree as ET
from IPython.display import display

from tickers500 import Tickers500

# Set display options to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)

class CongressTrades:
    
    def __init__(self):
        # Create an instance of the Tickers500 class
        self.tickers = Tickers500().tickers
        self.members = self.get_congress_members()
        self.trades = self.get_trades_by_member()
        
    def get_trades_by_member(self):
        congress_data = self.get_congress_trading_data()
        trades_by_member = {}
        
        try:
            for _, row in congress_data.iterrows():
                member = f"{row['Last']}".strip()
                doc_id = row['DocID']
                if member == "Pelosi":
                    print("DocID for download: ", doc_id)
                    pdf_df, trade_data = self.download_and_parse_pdf(doc_id)
                    
                    if member not in trades_by_member:
                        trades_by_member[member] = []
                    trades_by_member[member].extend(trade_data)
                else:
                    print("Member: ", member)    
                         
        except Exception as e:
            print(e)
        
        return trades_by_member

    def get_asset_type(self, asset_code = None) -> str:
        """
        Get the asset type codes from house.gov website.
        Parameters
        ----------
        asset_code : str
            The asset code to get the asset type name for.
        Returns
        -------
        str
            The asset name.
        """
        url = "https://fd.house.gov/reference/asset-type-codes.aspx"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        table = soup.find_all('table')[0]
        html_string = str(table)
        html_io = io.StringIO(html_string)
        df = pd.read_html(html_io)[0]

        df = df[df['Asset Code'] == asset_code]
        asset_name = df['Asset Name'].values[0]
        return asset_name

    def get_asset_type_df() -> pd.DataFrame:
        """
        Get the asset type codes from house.gov website.
        Returns
        -------
        pd.DataFrame
            A DataFrame containing the asset codes and their names.
        """
        url = "https://fd.house.gov/reference/asset-type-codes.aspx"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        table = soup.find_all('table')[0]
        html_string = str(table)
        html_io = io.StringIO(html_string)
        df = pd.read_html(html_io)[0]

        return df

    def get_congress_trading_data(self) -> pd.DataFrame:
        """
        Downloads the latest financial disclosure data from the House of Representatives
        and returns a DataFrame with the data.
        """

        file_path = 'data/congress/'
        current_year = datetime.datetime.now().year
        current_fd = str(current_year) + "FD"

        # Define the URL of the zip file
        url = "https://disclosures-clerk.house.gov/public_disc/financial-pdfs/" + current_fd + ".zip"

        # Send a GET request to download the zip file
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code != 200:
            print("Failed to download the file")
            sys.exit()

        # Load the zip file into memory
        zip_file = zipfile.ZipFile(io.BytesIO(response.content))

        # Initialize lists to store data
        txt_data = []
        xml_data = []

        # Extract the TXT file
        txt_file_name = current_fd + ".txt"
        with zip_file.open(txt_file_name) as txt_file:
            for line in txt_file:
                txt_data.append(line.decode("utf-8").strip().split("\t"))

        # Extract the XML file
        xml_file_name = current_fd + ".xml"
        with zip_file.open(xml_file_name) as xml_file:
            tree = ET.parse(xml_file)
            root = tree.getroot()

            for trade in root.findall('.//Member'):
                trade_data = {child.tag: child.text for child in trade}
                xml_data.append(trade_data)

        # Create DataFrames
        txt_df = pd.DataFrame(txt_data[1:], columns=txt_data[0])
        txt_df.reset_index(drop=True, inplace=True)

        # Create a DataFrame from the XML data
        xml_df = pd.DataFrame(xml_data)

        # Save the DataFrames to CSV files
        # txt_df.to_csv(file_path + current_fd + ".csv", index=False)
        xml_df.to_csv(file_path + 'csv/' + current_fd + ".csv", index=False)

        return xml_df
    
    def get_congress_members(self) -> list:
        """
        Get the members of Congress from the House of Representatives website.
        Returns
        -------
        dict
            A dictionary containing the members of Congress.
        """
        congress_data = self.get_congress_trading_data()

        congress_members = congress_data['Last'].unique().tolist()
        congress_members = congress_members[1:]

        return congress_members

    def download_and_parse_pdf(self, doc_id) -> pd.DataFrame:
        """
        """
        
        trade_dict = {
            "Owner": [],
            "Asset": [],
            "Ticker": [],
            "Transaction Type": [],
            "Transaction Date": [],
            "Notification Date": [],
            "Amount": [],
            "Filing Status": [],
            "Description": []
        }

        file_path = 'data/congress/'
        current_year = datetime.datetime.now().year
        pdf_file_name = doc_id + ".pdf"

        # Define the URL of the zip file
        url = "https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/" + str(current_year) + '/' + pdf_file_name

        # Send a GET request to download the zip file
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code != 200:
            print("Failed to download the file")
            sys.exit()

        # Use the pdfplumber library to extract text from the PDF

        # Create the pdf file
        with open(file_path + 'pdf/' + pdf_file_name, 'wb') as pdf_file:
            pdf_file.write(response.content)

        # Open the PDF file
        with pdfplumber.open(file_path + 'pdf/' + pdf_file_name) as pdf:
            pdf_text = "".join(page.extract_text() for page in pdf.pages)

        # Extract structured data
        pdf_data = []
        owner_types = ["SP", "DC", "JT"]
        lines = pdf_text.splitlines()

        i = 0
        while i < len(lines):
            line = lines[i]
            if any(line.startswith(owner_type) for owner_type in owner_types):
                columns = line.split()
                owner = columns[0]
                asset = " ".join(columns[1:-6])
                if i + 1 < len(lines) and lines[i + 1].strip().startswith("("):
                    asset += " " + lines[i + 1].strip().strip("()")
                ticker = columns[-6].removeprefix("(").removesuffix(")")
                if ticker.startswith("[") and ticker.endswith("]"):
                    ticker = self.get_asset_type(ticker.strip("[]"))
                # if ticker == "Stock":

                    # ticker = columns[-7].removeprefix("(").removesuffix(")")
                # if ticker not in self.tickers:
                #     ticker = columns[-7].removeprefix("(").removesuffix(")")
                #     if ticker not in self.tickers:
                #         ticker = columns[-8].removeprefix("(").removesuffix(")")
                transaction_type = columns[-5]
                transaction_date = columns[-4]
                notification_date = columns[-3]
                amount = "".join(columns[-2:-1])
                # filing_status = columns[-1]
                # description = " ".join(columns[-1:])

                # Check the next line for additional amount information
                if i + 1 < len(lines) and lines[i + 1].strip().startswith("["):
                    additional_amount = lines[i + 1].strip().split()[-1]
                    amount += " " + additional_amount
                    i += 1  # Skip the next line as it has been processed

                pdf_data.append([
                    owner, asset, ticker, transaction_type, transaction_date,
                    notification_date, amount
                ])
            i += 1
        
        for trade in pdf_data:
            trade_dict["Owner"].append(trade[0])
            trade_dict["Asset"].append(trade[1])
            trade_dict["Ticker"].append(trade[2])
            trade_dict["Transaction Type"].append(trade[3])
            trade_dict["Transaction Date"].append(trade[4])
            trade_dict["Notification Date"].append(trade[5])
            trade_dict["Amount"].append(trade[6])
            # trade_dict["Filing Status"].append(None)
            # trade_dict["Description"].append(None)
        


        # Convert to DataFrame
        pdf_df = pd.DataFrame(pdf_data, columns=[
            "Owner", "Asset", "Ticker", "Transaction Type",
            "Transaction Date", "Notification Date", "Amount"
        ])


        return pdf_df, trade_dict
    
    def get_doc_ids(self, trade_list) -> str:
        """
        Get the document IDs from the trade list.
        Parameters
        ----------
        trade_list : list
            The list of trades.
        Returns
        -------
        str
            The document IDs.
        """
        doc_ids = []
        for trade in trade_list:
            if trade['DocID'] == None:
                raise ValueError("DocID is missing, some members of Congress do not have a DocID for downloadable PDFs.")
            else:
                doc_id = trade['DocID']
            doc_ids.append(doc_id)
        return doc_ids