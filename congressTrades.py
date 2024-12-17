import requests
import zipfile
import pandas as pd
import re
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
        # self.members = []
        self.members = self.get_congress_members()
        self.junk_members = self.get_junk_members()
        self.trades = self.get_trades_by_member()
        
    def get_trades_by_member(self, member_list = None) -> pd.DataFrame:
        congress_data = self.get_congress_trading_data()
        trades_by_member_df = pd.DataFrame()
        
        try:
            for _, row in congress_data.iterrows():
                member = f"{row['Last']}".strip()
                # Check if the member is in the junk list
                # if member not in self.junk_members:
                if member in member_list:
                    doc_id = row['DocID']
                    if doc_id == None:
                        print("DocID is missing, some members of Congress do not have a DocID for downloadable PDFs.")
                        self.junk_members.append(member)
                        continue
                    self.members.append(member)
                    # print("DocID for download: ", member, ": ", doc_id)
                    
                    pdf_df = self.download_and_parse_pdf(doc_id)
                    
                    if type(pdf_df) == type(None):
                        self.junk_members.append(member)
                        print(member)
                        continue
                    
                    # Add the member name to the front of the DataFrame
                    pdf_df.insert(0, "Member", member)
                    # Add the docid to the DataFrame
                    pdf_df.insert(1, "DocID", doc_id)
                    
                    # Append the DataFrame to the trades_by_member_df
                    trades_by_member_df = pd.concat([pdf_df, trades_by_member_df], ignore_index=True)
                    
                else:
                    # print("Member: ", member) 
                    continue   
                         
        except Exception as e:
            print(e)
            
        # Save the DataFrame to a CSV file
        trades_by_member_df.to_csv("data/congress/csv/" + datetime.datetime.now().strftime("%Y%m%d") + "_trades_by_member.csv", index=False)
        
        return trades_by_member_df

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
    
    def get_junk_members(self):
        """
        Get the members of Congress that do not have a DocID for downloadable PDFs.
        Returns
        -------
        list
            A list containing the members of Congress that do not have a DocID for downloadable PDFs.
        """
        junk_members = []
        
        with open('data/congress/txt/junk_members.txt', 'r') as f:
            for line in f:
                junk_members.append(line.strip())
        
        return junk_members

    def download_and_parse_pdf(self, doc_id) -> pd.DataFrame:
        """
        Download and parse a financial disclosure PDF to extract structured trade data.
        Handles multi-line trade entries robustly.
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
        try:
            response = requests.get(url)

            # Check if the request was successful
            if response.status_code != 200:
                # print("Failed to download the file: ", doc_id)
                return None
        except Exception as e:
            print(e)
            print("Except: Failed to download the file: ", doc_id)
            return None

        # Use the pdfplumber library to extract text from the PDF

        # Create the pdf file
        with open(file_path + 'pdf/' + pdf_file_name, 'wb') as pdf_file:
            pdf_file.write(response.content)

        # Open the PDF file
        with pdfplumber.open(file_path + 'pdf/' + pdf_file_name) as pdf:
            pdf_text = "".join(page.extract_text() for page in pdf.pages)

    
        if not pdf_text.strip():
            print("PDF is empty: ", doc_id)
            return pd.DataFrame()

        lines = pdf_text.splitlines()
        
        owner_types = ["SP", "DC", "JT"]
        current_trade = {key: "" for key in trade_dict}  # Initialize a trade record
        
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()

            # Check if this is a new trade line starting with known owner types
            if any(line.startswith(owner_type) for owner_type in owner_types):
                if current_trade["Owner"]:  # If current_trade is not empty, save it
                    for key in trade_dict:
                        trade_dict[key].append(current_trade[key])
                    current_trade = {key: "" for key in trade_dict}  # Reset current trade

                
                columns = line.split()
                current_trade["Owner"] = columns[0]
                current_trade["Asset"] = " ".join(columns[1:-6]).split("-", 1)[0].strip()
                current_trade["Ticker"] = columns[-6].strip("()")
                if current_trade["Asset"].__contains__("("):
                    current_trade["Asset"], current_trade["Ticker"] = current_trade["Asset"].rsplit("(", 1)
                    current_trade["Ticker"] = current_trade["Ticker"].split(")")[0]
                current_trade["Transaction Type"] = columns[-5]
                current_trade["Transaction Date"] = columns[-4]
                current_trade["Notification Date"] = columns[-3]
                current_trade["Amount"] = columns[-2]
                # Set amount based on current case
                if current_trade["Amount"] == "$0":
                    current_trade["Amount"] = "None"
                elif current_trade["Amount"] == "$1":
                    current_trade["Amount"] = "$1 - $15,000"
                elif current_trade["Amount"] == "$15,001":
                    current_trade["Amount"] = "$15,001 - $50,000"
                elif current_trade["Amount"] == "$50,001":
                    current_trade["Amount"] = "$50,001 - $100,000"
                elif current_trade["Amount"] == "$100,001":
                    current_trade["Amount"] = "$100,001 - $250,000"
                elif current_trade["Amount"] == "$250,001":
                    current_trade["Amount"] = "$250,001 - $500,000"
                elif current_trade["Amount"] == "$500,001":
                    current_trade["Amount"] = "$500,001 - $1,000,000"
                elif current_trade["Amount"] == "$1,000,001":
                    current_trade["Amount"] = "$1,000,001 - $5,000,000"
                elif current_trade["Amount"] == "$5,000,001":
                    current_trade["Amount"] = "$5,000,001 - $25,000,000"
                if current_trade["Transaction Type"] == "(partial)":
                    current_trade["Transaction Type"] = columns[-6] + " " + columns[-5]

                    # current_trade["Ticker"] = re.search(r'\((.*?)\)', current_trade["Asset"]).group(1)

                # Look ahead for additional information (multi-line)
                j = i + 1
                while j < len(lines) and not any(lines[j].startswith(owner) for owner in owner_types):
                    next_line = lines[j].strip()
                    if next_line.startswith("* For the"):
                        break
                    elif next_line.startswith("("):  # Ticker continuation
                        current_trade["Ticker"] = re.search(r'\((.*?)\)', next_line).group(1)
                    elif next_line.startswith("Stock"):
                        current_trade["Asset"] += " " + next_line.split("Stock", 1)[0].strip()
                        current_trade["Ticker"] = re.search(r'\((.*?)\)', next_line).group(1)
                    elif next_line.startswith("F"):  # Filing Status
                        current_trade["Filing Status"] = next_line.split(":", 1)[1].strip()
                    elif next_line.startswith("D"):  # Description
                        current_trade["Description"] = next_line.split(":", 1)[1].strip()
                        

                    j += 1
                if current_trade["Ticker"] not in self.tickers:
                    print("Not in S&P 500: ", current_trade["Ticker"])
                    try:
                        current_trade["Ticker"] = self.get_asset_type(current_trade["Ticker"].strip("[]"))
                    except Exception as e:
                        print(e)
                        current_trade["Ticker"] = "Not in S&P 500"
                    
                # Append to trade dictionary
                for key in trade_dict:
                    trade_dict[key].append(current_trade[key])

                # Reset current trade and update index
                current_trade = {key: "" for key in trade_dict}
                i = j - 1  # Move index to the next owner line

            i += 1
        
        # Convert to DataFrame
        pdf_df = pd.DataFrame(trade_dict)


        return pdf_df
    
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